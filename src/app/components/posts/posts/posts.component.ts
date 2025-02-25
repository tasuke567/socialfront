import { Component, OnInit } from '@angular/core';
import { PostsService } from '../../../core/services/posts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post, Comment } from './models/post.model';
import { formatDistanceToNow } from 'date-fns';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  posts: Post[] = [];
  newPostTitle: string = '';
  newPostContent: string = '';
  isLoading: boolean = false;
  isEditing: boolean = false;
  editPostId: string = '';
  editingPostContent: string = '';
  currentUserProfileUrl: string | null = null;
  currentUser: string = '';
  currentUserId: string = '';
  feedbackMessage: string = '';
  isErrorFeedback: boolean = false;
  showActionsMap = new Map<string, boolean>();
  userId: string | null = null;
  // เก็บข้อความคอมเม้นต์สำหรับแต่ละโพสต์ แยกตาม post.id
  newCommentTextMap: { [postId: string]: string } = {};
  postLikersMap = new Map<string, User[]>();
  

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    // ดึงข้อมูลผู้ใช้จาก AuthService
    this.userId = this.authService.getUserId();
    const currentUserData = this.authService.getCurrentUser();
    console.log('Current User Data:', currentUserData);
    this.currentUser = currentUserData.username;
    this.currentUserProfileUrl = currentUserData.profilePicture || null;
    this.currentUserId = currentUserData.id;
  }

  ngOnInit(): void {
    this.fetchPosts();
  }

  // ============================================
  // Utility Functions
  // ============================================
  showNotification(message: string, isError: boolean = false): void {
    this.feedbackMessage = message;
    this.isErrorFeedback = isError;
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? 'snackbar-error' : 'snackbar-success',
    });
  }

  formatRelativeTime(dateObj: any): string {
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
  fetchPosts(): void {
    this.isLoading = true;
    this.postsService.getPosts().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          // เรียงโพสต์โดยให้โพสต์ที่ใหม่สุดอยู่ด้านบน
          this.posts = data.sort((a: any, b: any) => {
            const dateA = new Date(a.updatedAt || a.createdAt).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt).getTime();

            // ถ้าค่าเวลาที่ได้ไม่สามารถแปลงเป็นเวลาที่ถูกต้องให้ทำให้เป็นค่า 0
            if (isNaN(dateA)) return 1; // ถ้า dateA ไม่ถูกต้องให้มันอยู่ข้างล่าง
            if (isNaN(dateB)) return -1; // ถ้า dateB ไม่ถูกต้องให้มันอยู่ข้างล่าง

            return dateB - dateA; // คืนค่าผลลัพธ์การจัดเรียง
          });
          this.posts.forEach(post => {
            this.loadLikers(post.id);
            this.loadComments(post.id);
          });
        } else {
          this.posts = [];
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.showNotification('Error fetching data.', true); // แสดงข้อความผิดพลาด
      }
    );
  }

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
      owner: this.userId
    };

    this.isLoading = true;
    this.postsService.createPost(newPostPayload).subscribe(
      (response: Post) => {
        if (response.id) {
          // เพิ่มโพสต์ใหม่ในตำแหน่งแรกของอาร์เรย์
          this.posts.unshift(response);
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

  updatePost(postId: string, content: string): void {
    if (!postId) return;
    this.isLoading = true;
    this.postsService.updatePost(postId, { content }).subscribe(
      (response: any) => {
        const index = this.posts.findIndex((post) => post.id === postId);
        if (index !== -1) {
          // สมมุติว่า backend ส่งกลับโพสต์ที่อัพเดตแล้วใน response.post
          this.posts[index].content = response.post.content;
          this.posts[index].updatedAt = new Date(response.post.updatedAt);
          this.showNotification('Post updated successfully.', false);
        }
        this.resetEditing();
        this.isLoading = false;
      },
      (error) => {
        this.showNotification('Error updating post.', true);
        this.isLoading = false;
      }
    );
  }

  deletePost(postId: string): void {
    if (!this.userId) {
      this.showNotification('User not logged in', true);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    this.isLoading = true;
    this.postsService.deletePost(postId, Number(this.userId)).subscribe(
      () => {
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.showNotification('Post deleted successfully.', false);
        this.isLoading = false;
      },
      (error) => {
        this.showNotification('Error deleting post.', true);
        this.isLoading = false;
      }
    );
  }

  // ============================================
  // Post Action Functions
  // ============================================
  likePost(postId: string): void {
    this.postsService.likePost(postId).subscribe(
      () => {
        console.log('Post liked!');
        this.fetchPosts(); // รีเฟรชโพสต์หลังจาก like สำเร็จ
      },
      (error) => console.error('Error liking post', error)
    );
  }

  // เพิ่มการใช้งาน addComment() ใน PostsComponent
  commentOnPost(postId: string, commentText: string): void {
    if (!this.newCommentTextMap[postId]) {
      this.newCommentTextMap[postId] = ''; // กำหนดค่าเริ่มต้น
    }
    
    
    // ตรวจสอบว่ามีข้อความในคอมเมนต์หรือไม่
    if (!commentText || !commentText.trim()) return;  // เพิ่มการตรวจสอบ commentText ที่เป็น null หรือ undefined
  
    // สร้างคอมเมนต์ใหม่
    const newComment: Comment = {
      id: this.generateCommentId(),
      content: commentText, // เก็บข้อความคอมเมนต์จริงๆ
      createdAt: new Date(),
      postId: postId,  // ส่ง postId
      userId: this.userId!,
      username: this.currentUser,
    };
  
    // ส่งคำขอเพิ่มคอมเมนต์
    this.postsService.addComment(newComment.content, newComment.postId).subscribe(
      (response) => {
        // ถ้าคอมเมนต์ถูกเพิ่มสำเร็จ
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          // ถ้าโพสต์นี้ยังไม่มีฟิลด์ comments, ให้สร้างมันขึ้นมา
          if (!post.comments) {
            post.comments = [];
          }
  
          // ตรวจสอบและแปลง content ของคอมเมนต์ในโพสต์ที่มีอยู่ให้ถูกต้อง
          post.comments = post.comments.map(comment => {
            try {
              // แปลงค่า content เป็นข้อความจริง
              const parsedContent = JSON.parse(comment.content);
              return {
                ...comment,
                content: parsedContent.content || comment.content,  // ถ้าไม่สามารถแปลงได้ ให้ใช้ content เดิม
              };
            } catch (e) {
              return comment;  // ถ้าเกิดข้อผิดพลาดในการแปลง JSON ให้ใช้ content เดิม
            }
          });
  
          // เพิ่มคอมเมนต์ใหม่เข้าไปในโพสต์
          post.comments.push(response);
          // เคลียร์ข้อความคอมเมนต์ในฟอร์ม
          this.newCommentTextMap[postId] = '';
          // แสดงข้อความ notification
          this.showNotification('Comment added successfully.', false);
        }
        this.fetchPosts();
      },
      (error) => {
        // ถ้ามีข้อผิดพลาดในการเพิ่มคอมเมนต์
        this.showNotification('Error adding comment.', true);
      }
    );
  }
  

  sharePost(postId: string): void {
    this.postsService.sharePost(postId).subscribe(
      () => console.log('Post shared!'),
      (error) => console.error('Error sharing post', error)
    );
  }

  // ============================================
  // Editing Functions
  // ============================================
  editPost(postId: string, postContent: string): void {
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
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.showCommentSection = !post.showCommentSection;
      if (post.showCommentSection && (!post.comments || post.comments.length === 0)) {
        this.loadComments(postId);
      }
    }
  }
  
  toggleLike(postId: string): void {
    if (this.isLikedByCurrentUser(postId)) {
      // ถ้ากดไลค์อยู่ -> ยกเลิกไลค์
      this.postsService.unlikePost(postId).subscribe(
        () => {
          console.log('Post unliked!');
          this.fetchPosts(); // รีเฟรชโพสต์หลังจาก unlike สำเร็จ
        },
        (error) => console.error('Error unliking post', error)
      );
    } else {
      // ถ้ายังไม่ได้กดไลค์ -> กดไลค์
      this.postsService.likePost(postId).subscribe(
        () => {
          this.loadLikers(postId); // โหลดข้อมูลล่าสุดหลัง like
          this.fetchPosts();
        },
        (error) => console.error('Error liking post', error)
      );
    }
  }
  
  // เช็คว่าผู้ใช้ปัจจุบันกดไลค์โพสต์นี้หรือยัง
  isLikedByCurrentUser(post: any): boolean {
    return (post.likedBy || []).some((user: {id: String}) => user.id === this.currentUserId);
  }

  // ใหม่: ตรวจสอบจำนวนไลค์อย่างปลอดภัย
  getLikeCount(post: Post): number {
    return this.postLikersMap.get(post.id)?.length || 0;
  }

  loadLikers(postId: string): void {
    this.postsService.getPostLikers(postId).subscribe(
      (likers: User[]) => {
        this.postLikersMap.set(postId, likers);
      },
      (error) => console.error('Error loading likers', error)
    );
  }

  loadComments(postId: string): void {
    this.postsService.getComments(postId).subscribe({
      next: (comments) => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments = comments;
        }
      },
      error: (err) => {
        this.showNotification('Error loading comments', true);
      }
    });
  }
}
