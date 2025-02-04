import { Component } from '@angular/core';
import { PostsService } from '../../../core/services/posts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from './models/post.model';
import { formatDistanceToNow } from 'date-fns';
import { AuthService } from '../../../services/auth.service';

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
  // currentUser สามารถเป็น string ถ้าเก็บเพียงชื่อผู้ใช้
  currentUser: string = '';
  // ตัวแปรสำหรับ feedback message
  feedbackMessage: string = '';
  isErrorFeedback: boolean = false;
  // ตัวแปรสำหรับเก็บโพสต์ที่กำลังแก้ไข (ถ้าต้องการใช้ modal แบบ inline)
  editingPostContent: string = '';

  userId: string | null;

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {
    this.userId = this.authService.getUserId();
    const currentUserData = this.authService.getCurrentUser();
    // สมมุติว่า currentUserData.username เป็น string
    this.currentUser = currentUserData.username;
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
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        } else {
          this.posts = [];
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.feedbackMessage = 'Error fetching Data';
        this.isErrorFeedback = true;
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

    if (!this.userId || !this.currentUser) {
      console.error('User not logged in or missing data');
      this.feedbackMessage = 'User not logged in or missing data';
      this.isErrorFeedback = true;
      return;
    }

    const title = this.newPostTitle.trim() || 'My Post';

    const newPost = {
      title: title,
      content: this.newPostContent,
      userId: Number(this.userId)
    };

    this.postsService.createPost(newPost).subscribe(
      (response: any) => {
        console.log('Create Post Response:', response);
        // สมมุติว่า backend ส่ง response แบบ { post: {...} } หรือส่ง object ของโพสต์โดยตรง
        const createdPost = response.post || response;
        if (createdPost) {
          this.posts.unshift(createdPost);
          this.feedbackMessage = 'Post created successfully.';
          this.isErrorFeedback = false;
        } else {
          console.error('No post data found in response');
          this.feedbackMessage = 'Post creation failed.';
          this.isErrorFeedback = true;
        }
        this.newPostContent = '';
        this.newPostTitle = '';
      },
      (error) => {
        console.error('Error creating post:', error);
        this.feedbackMessage = 'Error creating post.';
        this.isErrorFeedback = true;
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
  }

  updatePost(postId: string, content: string): void {
    if (!postId) return;

    this.postsService.updatePost(postId, { content }).subscribe(
      (response: any) => {
        const updatedPostIndex = this.posts.findIndex(
          (post) => post.id === postId
        );
        if (updatedPostIndex !== -1) {
          this.posts[updatedPostIndex].content = response.post.content;
          // สมมุติว่า backend ส่ง updatedAt ด้วย
          this.posts[updatedPostIndex].updatedAt = new Date(response.post.updatedAt);
          this.feedbackMessage = 'Post updated successfully.';
          this.isErrorFeedback = false;
        }
        this.isEditing = false;
        this.editingPostContent = '';
        this.editPostId = '';
      },
      (error) => {
        console.error('Error updating post:', error);
        this.feedbackMessage = 'Error updating post.';
        this.isErrorFeedback = true;
      }
    );
  }

  deletePost(postId: string): void {
    if (!this.userId) {
      console.error('User not logged in');
      this.feedbackMessage = 'User not logged in';
      this.isErrorFeedback = true;
      return;
    }
    // ใช้ confirm dialog เพื่อขอยืนยันการลบโพสต์
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    this.postsService.deletePost(postId, Number(this.userId)).subscribe(
      () => {
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.feedbackMessage = 'Post deleted successfully.';
        this.isErrorFeedback = false;
      },
      (error) => {
        console.error('Error deleting post:', error);
        this.feedbackMessage = 'Error deleting post.';
        this.isErrorFeedback = true;
      }
    );
  }

  toggleActions(postId: string): void {
    this.showActions = this.showActions === postId ? null : postId;
  }
}
