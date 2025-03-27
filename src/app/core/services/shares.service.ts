import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SharesService {
  private apiUrl = `${environment.apiUrl}/shares`;

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

  // แชร์โพสต์แบบกระจายไวรัลให้โลกรู้!
  sharePost(postId: string): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/${postId}`, 
      {}, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ยกเลิกแชร์โพสต์ ถ้าเปลี่ยนใจหรือไม่ชอบ vibe แล้ว
  deletePostShare(postId: string): Observable<string> {
    return this.http.delete<string>(
      `${this.apiUrl}/${postId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ดูจำนวนแชร์ของโพสต์ เพื่อเช็คว่าโพสต์ฮิตแค่ไหน
  getShareCount(postId: string): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/${postId}/count`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ดูโพสต์ที่ผู้ใช้แชร์ (ให้รู้ว่าคุณแชร์ไปเต็มที่แน่นอน)
  getUserSharedPosts(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/user`,
      { headers: this.getAuthHeaders() }
    );
  }

  checkShareStatus(postId: string): Observable<{ shared: boolean }> {
    return this.http.get<{ shared: boolean }>(
      `${this.apiUrl}/${postId}/check`,
      { headers: this.getAuthHeaders() }
    );
  }
}
