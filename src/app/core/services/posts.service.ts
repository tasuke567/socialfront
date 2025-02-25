import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service'; // import AuthService
import { User } from '../../shared/models/user.model';

interface CreatePostDto {
  title: string;
  content: string;
  username: string;
}
interface Comment {
  id: string;
  userId: string;
  postId: string;
  username: string;
  content: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private apiUrl = 'http://localhost:8080/api/posts'; // URL ของ Backend
  postLikersMap = new Map<string, User[]>();

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ดึงโพสต์ทั้งหมด
  getPosts(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // สร้างโพสต์ใหม่
  createPost(post: CreatePostDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, post);
  }

  // ฟังก์ชันอัปเดตโพสต์
  updatePost(postId: string, updatedPost: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${postId}`, updatedPost);
  }

  // ลบโพสต์ (ส่ง userId เป็น query parameter ตามที่ backend ต้องการ)
  deletePost(postId: string, userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${postId}?userId=${userId}`);
  }

  // ฟังก์ชันดึง postId จาก post object
  getPostId(post: any): string {
    return post?.id || ''; // ตรวจสอบว่า post object มี id หรือไม่ ถ้าไม่มีจะคืนค่าเป็นค่าว่าง
  }

  likePost(postId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${postId}/like`, {});
  }

  unlikePost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${postId}/unlike`);
  }

  

  // ฟังก์ชัน Share โพสต์
  sharePost(postId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${postId}/share`, {});
  }
  // เพิ่มฟังก์ชัน addComment ใน PostsService
  addComment(content: string, postId: string): Observable<Comment> {
    const token = this.authService.getToken(); // รับ token จาก AuthService

    if (!token) {
      console.error('No token found');
      return new Observable<Comment>(); // ส่งคืน Observable ที่ไม่ทำอะไรเลยถ้าไม่มี token
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // เพิ่ม token ใน Authorization header
    });

    return this.http.post<Comment>(
      `${this.apiUrl}/${postId}/comment`,
      content,
      { headers }
    );
  }

  getPostLikers(postId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${postId}/likes`);
  }

  getComments(postId: string): Observable<Comment[]> {
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('No token found');
      return new Observable<Comment[]>();
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Comment[]>(
      `${this.apiUrl}/${postId}/comments`,
      { headers }
    );
  }
}
