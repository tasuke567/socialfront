import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
export interface CommentDTO {
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
export class CommentsService {
  private apiUrl = 'http://localhost:8080/api/comments';
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  } 

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ดึงคอมเมนต์ทั้งหมดของโพสต์ให้ฟินกันเต็มที่
  getCommentsByPost(postId: string): Observable<CommentDTO[]> {
    return this.http.get<CommentDTO[]>(`${this.apiUrl}/${postId}`, { headers: this.getAuthHeaders() });
    
  }

  // คอมเมนต์โพสต์ ใส่ความเห็นเจน Z ของคุณลงไปเลย
  commentOnPost(postId: string, content: string): Observable<CommentDTO> {
    return this.http.post<CommentDTO>(
      `${this.apiUrl}/${postId}`, 
      { content }, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ลบคอมเมนต์ของตัวเอง (ถ้าโพสต์นั้นไม่ใช่ vibe ก็ลบทิ้งได้เลย)
  deleteComment(commentId: string): Observable<string> {
    return this.http.delete<string>(
      `${this.apiUrl}/${commentId}`, 
      { headers: this.getAuthHeaders() }
    );
  }
}
