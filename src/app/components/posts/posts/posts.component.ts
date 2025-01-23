import { Component } from '@angular/core';
import { PostsService } from '../../../core/services/posts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../../../utils/date-utils';
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
  newPostContent: string = '';
  isLoading: boolean = false;
  isEditing: boolean = false;
  editPostId: string = '';
  userId: string | null;
  postId: string | '';
  editPostContent: string = '';
  showActions: string | null = null;
  currentUser: any;

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {
    this.userId = this.authService.getUserId();
    this.postId = this.postsService.getPostId(this.posts);
    this.currentUser = this.authService.getCurrentUser();  // ดึงข้อมูลผู้ใช้ที่ล็อกอิน
  }

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    this.isLoading = true;
    this.postsService.getPosts().subscribe(
      (data: any) => {
        if (Array.isArray(data.posts)) {
          this.posts = data.posts.map((post: Post) => {
            const createdAt = new Date(post.createdAt);
            return {
              ...post,
              createdAt: this.formatRelativeTime(post.createdAt),
              username: post.username,
              updatedAt: new Date(post.updatedAt),
            };
          });
        } else {
          this.posts = [];
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching posts:', error);
        this.isLoading = false;
      }
    );
  }

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
    return formatDistanceToNow(date, { addSuffix: true });
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;

    const newPost = { content: this.newPostContent, userId: this.userId };
    this.postsService.createPost(newPost).subscribe(
      (response: any) => {
        this.posts.unshift(response.post);
        this.newPostContent = '';
      },
      (error) => console.error('Error creating post:', error)
    );
  }

  editPost(postId: string, postContent: string) {
    this.editPostId = postId;
    this.editPostContent = postContent;
    this.isEditing = true;
  }

  savePost(): void {
    if (this.isEditing) {
      this.updatePost(this.editPostId, this.editPostContent);
    } else {
      this.createPost();
    }
  }

  deletePost(postId: string): void {
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.posts = this.posts.filter((post) => post.id !== postId);
      },
      (error) => console.error('Error deleting post:', error)
    );
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
          this.posts[updatedPostIndex].updatedAt = response.post.updatedAt;
        }
        this.isEditing = false;
        this.editPostContent = '';
        this.editPostId = '';
      },
      (error) => {
        console.error('Error updating post:', error);
      }
    );
  }

  toggleActions(postId: string): void {
    this.showActions = this.showActions === postId ? null : postId;
  }
  
}
