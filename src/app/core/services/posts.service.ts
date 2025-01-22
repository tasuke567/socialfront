import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service'; // import AuthService

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private apiUrl = 'http://localhost:3000/api/posts'; // URL ของ Backend

  constructor(private http: HttpClient, private authService: AuthService) {} // Inject AuthService

  // ดึงโพสต์ทั้งหมด
  getPosts(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // สร้างโพสต์ใหม่
  createPost(post: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, post);
  }

  // ฟังก์ชันอัปเดตโพสต์
  updatePost(postId: string, updatedPost: any): Observable<any> {
    console.log(postId, updatedPost);
    return this.http.put<any>(`${this.apiUrl}/${postId}`, updatedPost);
  }

  // ลบโพสต์
  deletePost(postId: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token not found'); // หรือจัดการตามต้องการถ้าไม่มี token
    }
    const userId = this.authService.decodeToken(token)?.userId;

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : {};
    const body = { userId }; // ส่ง userId ใน body (ถ้าจำเป็น)

    return this.http.delete<any>(`${this.apiUrl}/${postId}`, { headers, body });
  }
  // ฟังก์ชันดึง postId จาก post object
  getPostId(post: any): string {
    return post?.id || ''; // ตรวจสอบว่า post object มี id หรือไม่ ถ้าไม่มีจะคืนค่าเป็นค่าว่าง
  }
}
