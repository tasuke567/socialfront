import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../../shared/models/user.model';
import { FriendRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FriendsApiService {
  // Base URL ของ API เพื่อน ๆ ของเรา
  private apiUrl = 'http://localhost:8080/api/friends';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ฟังก์ชันจับ error แบบเจน Z: แจ้ง error แบบสั้น ๆ ไม่ต้องมาปวดหัว
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Friends API Error:', error);
    return throwError(
      () => error.error?.message || 'Something went wrong, bro!'
    );
  }

  // ดึงรายชื่อเพื่อนของตัวเอง (จาก token ที่ล็อกอินอยู่)
  getFriends(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}/list`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ดึงคำขอเป็นเพื่อนที่ค้างอยู่ (เช็ค inbox เพื่อน ๆ กันเลย)
  getPendingRequests(): Observable<FriendRequest[]> {
    return this.http
      .get<FriendRequest[]>(`${this.apiUrl}/pending-requests`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getRequests(): Observable<FriendRequest[]> {
    return this.http
      .get<FriendRequest[]>(`${this.apiUrl}/requests`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
 

  // แนะนำเพื่อนใหม่ ๆ ให้คุณ (บางทีคุณอาจอยากขยายวงเพื่อนให้ mega cool)
  getFriendSuggestions(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}/suggestions`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ส่งคำขอเป็นเพื่อนไปหาใครสักคน (ส่ง vibes ดี ๆ ให้กับ userId ที่เลือก)
  sendFriendRequest(userId: string): Observable<string> {
    return this.http
      .post<string>(
        `${this.apiUrl}/request/${userId}`,
        {},
        { headers: this.getHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  // ยอมรับคำขอเป็นเพื่อน (รับ vibes ดี ๆ จากคำขอที่เข้ามา)
  acceptFriendRequest(requestId: string): Observable<string> {
    return this.http
      .post<string>(
        `${this.apiUrl}/accept/${requestId}`,
        {},
        { headers: this.getHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  // ลบเพื่อนออกจากรายชื่อ (ถ้า vibe เปลี่ยน ก็จัดการให้เรียบร้อย)
  removeFriend(userId: string): Observable<string> {
    return this.http
      .delete<string>(`${this.apiUrl}/remove/${userId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  cancelFriendRequest(userId: string): Observable<string> {
    return this.http
      .delete<string>(`${this.apiUrl}/cancel/${userId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
  declineFriendRequest(requestId: string): Observable<string> {
    return this.http
      .delete<string>(`${this.apiUrl}/decline/${requestId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
}
