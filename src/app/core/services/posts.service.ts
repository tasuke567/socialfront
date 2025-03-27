import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // import AuthService
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
  private apiUrl = 'http://localhost:8080/api/posts'; // URL ของ Backend สำหรับโพสต์

  // Map เก็บข้อมูลผู้ที่กดไลก์ให้โพสต์ (เอาไว้ track ว่าใครฮอตโพสต์นี้)
  postLikersMap = new Map<string, User[]>();

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Helper function ดึง token แล้วสร้าง HttpHeaders ให้ทุก API Request
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // ดึงโพสต์ทั้งหมด (Feed ของเราไม่ต้องรอนาน)
  getPosts(): Observable<any> {
    const feed = '/feed';
    return this.http.get<any>(this.apiUrl + feed, {
      headers: this.getAuthHeaders(),
    });
  }

  // สร้างโพสต์ใหม่ (โพสต์เรื่องราวสุด epic ของคุณได้เลย)
  createPost(post: CreatePostDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, post, {
      headers: this.getAuthHeaders(),
    });
  }

  // อัปเดตโพสต์ (รีมิกซ์โพสต์เก่าให้ลุคใหม่)
  updatePost(postId: string, updatedPost: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${postId}`, updatedPost, {
      headers: this.getAuthHeaders(),
    });
  }

  // ลบโพสต์ (ถ้าโพสต์นั้นไม่ใช่ vibe ก็ให้ลบทิ้ง)
  deletePost(postId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${postId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ดึง postId จาก post object (เพราะบางทีข้อมูลอาจจะสับสน)
  getPostId(post: any): string {
    return post?.id || '';
  }



}
