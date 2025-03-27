import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatDistanceToNow } from 'date-fns';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { PostsService } from '../../../../core/services/posts.service';
import { CommentsService } from '../../../../core/services/comments.service';
import { LikesService } from '../../../../core/services/likes.service';
import { SharesService } from '../../../../core/services/shares.service';
import { AuthService } from '../../../../core/services/auth.service';

import { Post, Comment, CommentDTO } from '../../models/post.model';
import { LikedUser } from '../../../../shared/models/user.model';
import { ProfilePictureComponent } from '../../../../shared/components/profile-picture/profile-picture.component';
import { CommentsComponent } from '../../../../features/posts/components/comments/comments.component';
import { SharesComponent } from '../shares/shares.component';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { EditPostModalComponent } from './components/app-edit-post-modal.component';
import { UserProfile } from './../../../../core/models/user-profile.model';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProfilePictureComponent,
    CommentsComponent,
    SharesComponent,
    ConfirmDeleteModalComponent,
    EditPostModalComponent,
  ],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  @Input() post: Post | null = null;
  @Input() user?: UserProfile | null;
  @Output() onLike = new EventEmitter<string>();
  @Output() onComment = new EventEmitter<string>();
  @Output() onShare = new EventEmitter<string>();
  @Output() onCommentSubmit = new EventEmitter<{
    postId: string;
    commentText: string;
  }>();
  @Output() onEdit = new EventEmitter<{
    postId: string;
    postContent: string;
  }>();
  @Output() onSave = new EventEmitter<Post>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<string>();

  // For edit modal
  selectedPost!: Post;
  showEditModal = false;

  // --- Post & Comment Data ---
  newPostTitle: string = '';
  newPostContent: string = '';
  newCommentTextMap: { [postId: string]: string } = {};

  // --- Loading & Editing States ---
  isLoading: boolean = false;
  isEditing: boolean = false;
  isSharing: boolean = false;
  editPostId: string = '';
  editingPostContent: string = '';
  loadingLikeIds = new Set<string>();

  // --- User Data ---
  currentUserProfileUrl: string | null = null;
  currentUser: string = '';
  currentUserId: string = '';
  userId: string | null = null;

  // --- Feedback ---
  feedbackMessage: string = '';
  isErrorFeedback: boolean = false;

  // --- Like Data ---
  likedPosts: Set<string> = new Set();
  postLikersMap = new Map<string, LikedUser[]>();

  // --- UI State ---
  showActionsMap = new Map<string, boolean>();
  isModalOpen = false;
  showDeleteModal = false;

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private commentsService: CommentsService,
    private likesService: LikesService,
    private sharesService: SharesService,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) {
    // Retrieve user data from AuthService
    this.userId = this.authService.getUserId();
    const currentUserData = this.authService.getCurrentUser();
    this.currentUser = currentUserData.username;
    this.currentUserProfileUrl = currentUserData.profilePicture || null;
    this.currentUserId = currentUserData.id;
  }

  ngOnInit(): void {
    if (this.post) {
      this.likesService.checkLikeStatus(this.post.id).subscribe({
        next: (response) => {
          if (response.liked) {
            this.likedPosts.add(this.post!.id);
          } else {
            this.likedPosts.delete(this.post!.id);
          }
          this.cdRef.detectChanges();
        },
        error: (err) => console.error('Error checking like status:', err),
      });
      this.loadUserLikedPosts(this.post.id);
    }
    this.cdRef.detectChanges()
  }

  // ============================================
  // Notification & Utility Functions
  // ============================================
  showNotification(message: string, isError: boolean = false): void {
    this.feedbackMessage = message;
    this.isErrorFeedback = isError;
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? 'snackbar-error' : 'snackbar-success',
    });
  }

  formatRelativeTime(dateObj: Date): string {
    if (!dateObj) return 'N/A';
    const date = new Date(dateObj);
    return isNaN(date.getTime())
      ? 'N/A'
      : formatDistanceToNow(date, { addSuffix: true });
  }

  generateCommentId(): string {
    return 'id-' + Math.random().toString(36).substr(2, 9);
  }

  // ============================================
  // Post CRUD Functions
  // ============================================
  createPost(): void {
    if (!this.newPostContent.trim()) return;
    if (!this.currentUser) {
      this.showNotification('User not logged in or missing data.', true);
      return;
    }

    const newPostPayload = {
      title: this.newPostTitle.trim() || 'My Post',
      content: this.newPostContent,
      username: this.currentUser,
      owner: this.userId,
    };

    this.isLoading = true;
    this.postsService.createPost(newPostPayload).subscribe(
      (response: Post) => {
        if (response.id) {
          this.post = response;
          this.showNotification('Post created successfully.', false);
        } else {
          this.showNotification('Post creation failed.', true);
        }
        this.resetNewPost();
      },
      (error) => {
        this.showNotification('Error creating post.', true);
        this.isLoading = false;
      }
    );
  }

  updatePost(postId: string, content: string , title: string): void {
    if (!postId) return;
    this.isLoading = true;

    this.postsService
      .updatePost(postId, { content , title })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          if (this.post) {
            // Use response.content and response.updated_at directly if response doesn't contain a nested "post" object
            this.post.content = response.content;
            this.post.updated_at = new Date(response.updated_at);
          }
          this.showNotification('Post updated successfully.', false);
          this.resetEditing();
        },
        error: (error) => {
          this.showNotification('Error updating post.', true);
        },
      });
  }


  deletePost(postId: string): void {
    if (!this.userId) {
      this.showNotification('User not logged in', true);
      return;
    }

    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.post = null;
        this.showNotification('Post deleted successfully.', false);
        this.isLoading = false;
      },
      (error) => {
        this.showNotification('Error deleting post.', true);
        this.isLoading = false;
      }
    );
    this.closeDeleteModal();
  }

  // ============================================
  // Comment Functions
  // ============================================
  commentOnPost(postId: string, commentText: string): void {
    if (!commentText || !commentText.trim()) return;

    const newComment: Comment = {
      id: this.generateCommentId(),
      content: commentText,
      created_at: new Date(),
      post_id: postId,
      user_id: this.userId!,
      username: this.currentUser,
    };

    this.commentsService.commentOnPost(newComment.post_id, newComment.content).subscribe(
      (response: CommentDTO) => {
        if (this.post) {
          this.post.comments = this.post.comments || [];
          this.post.comments.push(response as unknown as Comment);
          this.newCommentTextMap[postId] = '';
          this.showNotification('Comment added successfully.', false);
        }
      },
      (error) => {
        this.showNotification('Error adding comment.', true);
      }
    );
  }

  // ============================================
  // Share Functions
  // ============================================
  sharePost(postId: string): void {
    this.sharesService.sharePost(postId).subscribe(
      () => this.showNotification('Post shared successfully.', false),
      (error) => this.showNotification('Error sharing post.', true)
    );
  }

  // ============================================
  // Editing Functions & Modal Integration
  // ============================================
  editPost(postId: string, postContent: string): void {
    this.editPostId = postId;
    this.editingPostContent = postContent;
    this.isEditing = true;
    this.openEditModal(this.post!);
  }

  openEditModal(post: Post): void {
    this.selectedPost = post;
    this.showEditModal = true;
  }

  savePost(updatedPost: Post): void {

    // updatedPost is emitted by the EditPostModal
    this.updatePost(updatedPost.id, updatedPost.content, updatedPost.title);
    this.resetEditing();
    this.closeEditModal();
    this.cdRef.detectChanges();
    this.showNotification('Post updated successfully.', false);
    this.cdRef.detectChanges();
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  // ============================================
  // Reset Functions
  // ============================================
  resetNewPost(): void {
    this.newPostContent = '';
    this.newPostTitle = '';
    this.isLoading = false;
  }

  resetEditing(): void {
    this.isEditing = false;
    this.editPostId = '';
    this.editingPostContent = '';
  }

  // ============================================
  // UI Helper Functions
  // ============================================
  toggleActions(postId: string): void {
    this.showActionsMap.set(postId, !this.showActionsMap.get(postId));
  }

  toggleCommentSection(postId: string): void {
    if (this.post) {
      if (!this.post.comments || this.post.comments.length === 0) {
        this.loadComments(postId);
      }
      this.post.show_comment_section = !this.post.show_comment_section;
    }
  }

  loadComments(postId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.commentsService.getCommentsByPost(postId).subscribe({
        next: (comments) => {
          if (this.post) {
            this.post.comments = comments.map(dto => ({
              ...dto,
              post_id: dto.postId,
              user_id: dto.userId,
              created_at: new Date(dto.createdAt),
            }));
          }
          resolve();
        },
        error: (err) => {
          this.showNotification('Error loading comments', true);
          reject(err);
        },
      });
    });
  }

  // ============================================
  // Like Functions
  // ============================================
  getLikeCount(post: Post): number {
    const likers = this.postLikersMap.get(post.id.toString());
    return likers?.length || 0;
  }

  toggleLike(postId: string): void {
    if (!postId || !this.userId) return;
    if (this.loadingLikeIds.has(postId)) return;

    const wasLiked = this.isLikedByCurrentUser(postId);
    this.loadingLikeIds.add(postId);

    (wasLiked ? this.likesService.unlikePost(postId) : this.likesService.likePost(postId))
      .subscribe({
        next: () => {
          this.likedPosts[wasLiked ? 'delete' : 'add'](postId);
          this.loadUserLikedPosts(postId);
          this.loadingLikeIds.delete(postId);
          this.cdRef.detectChanges();
        },
        error: (err) => {
          this.showNotification(
            `Error ${wasLiked ? 'unliking' : 'liking'} post: ${err.error?.message ? err.error.message : err.error || 'Unknown error'}`,
            true
          );
          this.likedPosts[wasLiked ? 'add' : 'delete'](postId);
          this.loadingLikeIds.delete(postId);
          this.cdRef.detectChanges();
        },
      });
  }

  loadUserLikedPosts(postId: string): void {
    this.likesService.getPostLikers(postId).subscribe({
      next: (likers: LikedUser[]) => {
        this.postLikersMap.set(postId, likers);
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching liked posts:', err);
      },
    });
  }

  isLikedByCurrentUser(postId: string): boolean {
    return this.likedPosts.has(postId);
  }

  openDeleteModal(): void {
    this.isModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isModalOpen = false;
  }
}
