import { Component } from '@angular/core';
import { PostsService } from '../../../core/services/posts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from './models/post.model';
import { formatDistanceToNow } from 'date-fns';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent {
  posts: Post[] = [];
  newPostTitle: string = '';
  newPostContent: string = '';
  isLoading: boolean = false;
  isEditing: boolean = false;
  editPostId: string = '';
  currentUserProfileUrl: string | null = null;
  showActions: string | null = null;
  currentUser: string = '';
  feedbackMessage: string = '';
  isErrorFeedback: boolean = false;
  editingPostContent: string = '';
  public showActionsMap = new Map<string, boolean>();
  userId: string | null;

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.userId = this.authService.getUserId();
    const currentUserData = this.authService.getCurrentUser();
    console.log('Current User Data:', currentUserData); // ดูค่าผลลัพธ์จาก getCurrentUser()
    this.currentUser = currentUserData.username;
  }

  showNotification(message: string, isError: boolean = false): void {
    this.feedbackMessage = message;
    this.isErrorFeedback = isError;
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? 'snackbar-error' : 'snackbar-success',
    });
  }

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    this.isLoading = true;
    this.postsService.getPosts().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          // เรียงโพสต์จากวันที่ใหม่สุดอยู่ด้านบน (หากมีฟิลด์ createdAt ที่ถูกต้อง)
          this.posts = data.sort((a: any, b: any) => {
            const dateA = new Date(a.updatedAt || a.createdAt).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt).getTime();
            return dateB - dateA; // เรียงโพสต์ใหม่สุดขึ้นก่อน
          });
        } else {
          this.posts = [];
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.showNotification('Error fetching Data.', false);
      }
    );
  }

  formatRelativeTime(dateObj: any): string {
    if (!dateObj) {
      return 'N/A';
    }
    const date = new Date(dateObj);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;
  
    if (!this.currentUser) {
      console.error('User not logged in or missing data');
      this.showNotification('User not logged in or missing data.', true);
      return;
    }
  
    const title = this.newPostTitle.trim() || 'My Post';
    this.isLoading = true;
  
    // เพิ่ม username ในการส่งข้อมูล
    const newPost = {
      title: title,
      content: this.newPostContent,
      username: this.currentUser  // เพิ่ม username จาก currentUser
    };
  
    this.postsService.createPost(newPost).subscribe(
      (response: Post) => {
        console.log('Create Post Response:', response);
        
        if (response.id) {
          this.posts.unshift(response);
          this.showNotification('Post created successfully.', false);
        } else {
          console.error('Invalid post response');
          this.showNotification('Post creation failed.', true);
        }
  
        this.newPostContent = '';
        this.newPostTitle = '';
        this.isLoading = false;
      },
      (error) => {
        console.error('Error creating post:', error);
        this.showNotification('Error creating post.', true);
        this.isLoading = false;
      }
    );
  }

  editPost(postId: string, postContent: string): void {
    // กำหนดให้แสดงฟอร์มแก้ไขโพสต์ (ใน modal หรือ inline)
    this.editPostId = postId;
    this.editingPostContent = postContent;
    this.isEditing = true;
  }

  savePost(): void {
    if (this.isEditing) {
      this.updatePost(this.editPostId, this.editingPostContent);
    } else {
      this.createPost();
    }
    this.resetEditing();
  }

  updatePost(postId: string, content: string): void {
    if (!postId) return;
    this.isLoading = true;

    this.postsService.updatePost(postId, { content }).subscribe(
      (response: any) => {
        const updatedPostIndex = this.posts.findIndex(
          (post) => post.id === postId
        );
        if (updatedPostIndex !== -1) {
          this.posts[updatedPostIndex].content = response.post.content;
          // สมมุติว่า backend ส่ง updatedAt ด้วย
          this.posts[updatedPostIndex].updatedAt = new Date(
            response.post.updatedAt
          );
          this.showNotification('Post updated successfully.', true);
        }
        this.isEditing = false;
        this.editingPostContent = '';
        this.editPostId = '';
        this.isLoading = false;
      },
      (error) => {
        console.error('Error updating post:', error);
        this.showNotification('Error updating post.', false);
        this.isLoading = false;
      }
    );
  }

  deletePost(postId: string): void {
    if (!this.userId) {
      console.error('User not logged in');
      this.showNotification('User not logged in', false);
      return;
    }
    // ใช้ confirm dialog เพื่อขอยืนยันการลบโพสต์
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    this.isLoading = true;
    this.postsService.deletePost(postId, Number(this.userId)).subscribe(
      () => {
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.showNotification('Post deleted successfully.', true);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error deleting post:', error);
        this.showNotification('Error deleting post.', false);
        this.isLoading = false;
      }
    );
  }

  toggleActions(postId: string): void {
    this.showActionsMap.set(postId, !this.showActionsMap.get(postId));
  }
  resetEditing(): void {
    this.isEditing = false;
    this.editPostId = '';
    this.editingPostContent = '';
  }
}
