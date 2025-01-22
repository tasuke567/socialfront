import { Component } from '@angular/core';
import { PostsService } from '../../../core/services/posts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../../../utils/date-utils'; // นำเข้า interface Post
import { formatDistanceToNow } from 'date-fns'; // ใช้ฟังก์ชันจาก date-fns
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
  newPostContent: string = '';
  isLoading: boolean = false;
  isEditing: boolean = false; // ใช้สำหรับเช็คว่ากำลังแก้ไขโพสต์หรือไม่
  editPostId: string = ''; // เก็บ id ของโพสต์ที่ต้องการแก้ไข
  userId: string | null;
  postId: string | '';
  editPostContent: string = '';

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {
    this.userId = this.authService.getUserId();
    this.postId = this.postsService.getPostId(this.posts); 
  }

  ngOnInit(): void {
    this.fetchPosts();
  }

  // แปลงเวลาสำหรับแสดงแบบ relative
  formatRelativeTime(dateObj: any): string {
    const { year, month, day, hour, minute, second } = dateObj;

    const date = new Date(
      year.low,
      month.low - 1,
      day.low,
      hour.low + 7,
      minute.low,
      second.low
    );

    return formatDistanceToNow(date, { addSuffix: true }); // แสดงเวลาล่าสุด เช่น "5 นาทีที่แล้ว"
  }

  // ฟังก์ชันสร้างโพสต์ใหม่
  createPost(): void {
    if (!this.newPostContent.trim()) return;
  
    const newPost = { content: this.newPostContent, userId: this.userId };
    this.postsService.createPost(newPost).subscribe(
      (response: any) => {
        // เพิ่มโพสต์ใหม่ที่ได้รับจากการสร้างโพสต์
        this.posts.unshift(response.post);
        this.newPostContent = ''; // ล้างฟอร์ม
      },
      (error) => console.error('Error creating post:', error)
    );
  }
  

  fetchPosts(): void {
    this.isLoading = true;
    this.postsService.getPosts().subscribe(
      (data: any) => {
        this.posts = data.posts.map((post: Post) => {
          const createdAt = new Date(post.createdAt); // แปลงเป็น Date
          return {
            ...post,
            createdAt: this.formatRelativeTime(post.createdAt), // ใช้เวลาแบบ relative
            updatedAt: new Date(post.updatedAt),
          };
        });
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching posts:', error);
        this.isLoading = false;
      }
    );
  }


  // ฟังก์ชันแสดงโพสต์ที่ต้องการแก้ไข
  editPost(postId: string, postContent: string) {
    this.editPostId = postId;
    this.editPostContent = postContent; // กำหนดเนื้อหาของโพสต์ที่ต้องการแก้ไข
    this.isEditing = true; // เปิดโหมดแก้ไข
  }

  // ฟังก์ชันบันทึกโพสต์ที่แก้ไข
  savePost(): void {
    if (this.isEditing) {
      this.updatePost(this.editPostId, this.editPostContent);
    } else {
      this.createPost();
    }
  }
  

  // ลบโพสต์
  deletePost(postId: string): void {
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.posts = this.posts.filter((post) => post.id !== postId);
      },
      (error) => console.error('Error deleting post:', error)
    );
  }
  // ฟังก์ชันสำหรับการอัปเดตโพสต์
  updatePost(postId: string, content: string): void {
    if (!postId) return;
  
    this.postsService.updatePost(postId, { content }).subscribe(
      (response: any) => {
        // ค้นหาโพสต์ที่ถูกแก้ไขในลิสต์แล้วอัปเดต
        const updatedPostIndex = this.posts.findIndex(post => post.id === postId);
        if (updatedPostIndex !== -1) {
          this.posts[updatedPostIndex].content = response.post.content;
          this.posts[updatedPostIndex].updatedAt = response.post.updatedAt;
        }
        this.isEditing = false; // ปิดโหมดแก้ไข
        this.editPostContent = ''; // รีเซ็ตเนื้อหาที่กำลังแก้ไข
        this.editPostId = ''; // รีเซ็ต ID ของโพสต์ที่กำลังแก้ไข
      },
      (error) => {
        console.error('Error updating post:', error);
      }
    );
  }
  
}
