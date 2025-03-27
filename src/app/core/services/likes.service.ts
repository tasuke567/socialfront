import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LikedUser, User } from '../../shared/models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LikesService {
  private apiUrl = 'http://localhost:8080/api/likes';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // กดไลก์โพสต์แบบไม่รอช้า!
  likePost(postId: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/${postId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as const
    });
  }

  // ยกเลิกไลก์โพสต์ เพราะบางที mood อาจเปลี่ยน!
  unlikePost(postId: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${postId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as const
    });
  }

  // ดูจำนวนไลก์ของโพสต์ เพื่อเช็คว่ามีคนชอบกันแค่ไหน
  getLikeCount(postId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${postId}/count`, {
      headers: this.getAuthHeaders()
    });
  }

  getPostLikers(postId: string): Observable<LikedUser[]> {
    return this.http.get<LikedUser[]>(`${this.apiUrl}/${postId}/likers`, {
      headers: this.getAuthHeaders()
    });
  }

  // ตรวจสอบสถานะไลก์โพสต์ ว่าไลค์แล้วหรือยัง
  checkLikeStatus(postId: string): Observable<{ liked: boolean }> {
    return this.http.get<{ liked: boolean }>(`${this.apiUrl}/${postId}/check`, {
      headers: this.getAuthHeaders()
    });
  }
}
