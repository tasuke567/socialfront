import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service'; // import AuthService

interface CreatePostDto {
  title: string;
  content: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private apiUrl = 'http://localhost:8080/api/posts'; // URL ของ Backend

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
}
