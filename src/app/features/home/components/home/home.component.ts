import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { PostsComponent } from '../../../posts/components/posts/posts.component';
import { PostFormComponent } from '../../../posts/components/postsform/postsform.component';
import { Post } from '../../../posts/models/post.model';
import { PostsService } from '../../../../core/services/posts.service';
import { CommentDTO, Comment } from '../../../posts/models/post.model';
import { HttpClient } from '@angular/common/http';
import { CommentsService } from '../../../../core/services/comments.service';
import { LikesService } from '../../../../core/services/likes.service';
import { UserProfile } from '../../../../core/models/user-profile.model';
import { InterestFormComponent } from '../../../interests/components/interest-form/interest-form.component';
import { InterestsService } from '../../../../core/services/interests.service';
interface CreatePostDto {
  ownerId: string;
  title: string;
  content: string;
  username: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostsComponent, PostFormComponent, InterestFormComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  currentUserProfileUrl?: string;
  currentUser?: string;
  isLoading = false;
  posts: Post[] = []; 
  errorMessage: string = '';
  newCommentTextMap: { [postId: string]: string } = {}; 
  loading = false;
  error: string | null = null;
  currentUserProfile: UserProfile | null = null;
  showInterestForm = false;

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private router: Router,
    private commentsService: CommentsService,
    private likesService: LikesService,
    private http: HttpClient,
    private interestsService: InterestsService
  ) {}

  ngOnInit() {

    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
      } else {
        this.loadUserData();
        this.fetchPosts();
      }
    });
     // subscribe userProfile$ เพื่อรับข้อมูลโปรไฟล์ผู้ใช้
  this.authService.userProfile$.subscribe((userProfile) => {
    if (userProfile) {
      this.currentUserProfile = userProfile;
      // ถ้า userProfile ไม่มีความสนใจ (hasInterests === false) ให้เปิด pop up form
      if (userProfile.hasInterests === false) {
        this.openInterestForm();
      }
    }
  });
  }

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  loadUserData() {
    const currentUserData = this.authService.getCurrentUser();
    this.currentUser = currentUserData?.username || 'Guest';
    this.currentUserProfileUrl = currentUserData?.profilePicture || null;
  }

  // ดึงโพสต์ทั้งหมด
  fetchPosts(): void {
    this.isLoading = true;
    this.postsService.getPosts().subscribe({
      next: (data: Post[]) => {
        this.posts = data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load posts. Please try again later.';
      },
    });
  }

  // สร้างโพสต์ใหม่
  createPost(postData: { title: string; content: string }) {
    if (!postData.content.trim()) return;

    this.isLoading = true;
    const newPost: Partial<Post> = {
      title: postData.title,
      content: postData.content,
      username: this.currentUser!,
    };

    this.postsService.createPost(newPost as CreatePostDto).subscribe({
      next: (response) => {
        this.posts.unshift(response);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to create post.';
      },
    });
  }

  // แชร์โพสต์ (เพิ่มฟังก์ชัน)
  sharePost(postId: string) {
    console.log(`Shared post ${postId}`);
  }

  // คอมเมนต์โพสต์
  commentOnPost(postId: string, commentText: string) {
    if (!commentText.trim()) return;

    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    this.commentsService.commentOnPost(postId, commentText).subscribe(
      (newComment: CommentDTO) => {
        const comment: Comment = {
          id: newComment.id,
          post_id: newComment.postId,
          user_id: newComment.userId,
          username: newComment.username,
          content: newComment.content,
          created_at: newComment.createdAt,
        };

        post.comments = post.comments
          ? [...post.comments, comment]
          : [comment];
        this.newCommentTextMap[postId] = '';
      },
      (error) => {
        console.error('Error adding comment:', error);
      }
    );
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  toggleLike(postId: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.liked_by_user) {
      this.likesService.unlikePost(postId).subscribe(() => {
        post.liked_by_user = false;
        post.like_count--;
      });
    } else {
      this.likesService.likePost(postId).subscribe(() => {
        post.liked_by_user = true;
        post.like_count++;
      });
    }
  }

  // เปิด/ปิดคอมเมนต์
  toggleCommentSection(postId: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.show_comment_section = !post.show_comment_section;
    }
  }

  handleInterestSubmit(interests: string[]) {
    this.isLoading = true;
    this.interestsService.addUserInterests(interests).subscribe({
      next: (results) => {
        const successfulAdds = results.filter(r => r.success);
        const errors = results.filter(r => !r.success);
        
        if (errors.length > 0) {
          console.warn('Partial success:', errors);
        }
        
        // Refresh user profile data
        this.authService.getProfile().subscribe(updatedProfile => {
          this.authService.updateUserInterestsStatus(updatedProfile.hasInterests);
        });
        
        this.showInterestForm = false;
      },
      error: (error) => {
        console.error('Error saving interests:', error);
        this.errorMessage = 'Failed to save interests. Please try again.';
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }

  // เปิดหน้าต่างความสนใจ
  openInterestForm() {
    this.showInterestForm = true;
  }
  // ปิดหน้าต่างความสนใจ
  closeInterestForm() {
    this.showInterestForm = false;
  }

  
}
