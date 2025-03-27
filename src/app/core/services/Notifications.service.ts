import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  // เพิ่มฟิลด์อื่นๆ ตามที่ API ส่งกลับมาได้เลย!
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private apiUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }

  // ดึงการแจ้งเตือนทั้งหมดให้คุณแบบไม่ต้องรอนาน
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ทำเครื่องหมายว่าอ่านแล้วให้กับการแจ้งเตือนที่เลือก
  markAsRead(notificationId: string): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${notificationId}/read`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // เพิ่มการแจ้งเตือนใหม่ (ใช้สำหรับแอดมินหรือระบบ)
  createNotification(userId: string, message: string): Observable<string> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('message', message);
    return this.http.post<string>(`${this.apiUrl}/add`, null, { 
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ลบการแจ้งเตือนที่ไม่ต้องการออกไป
  deleteNotification(notificationId: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${notificationId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // จัดการ error แบบเจน Z ไม่ซับซ้อน แจ้งให้รู้ว่ามีอะไรผิดพลาด
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Notifications API Error:', error);
    return throwError(() => error.error?.message || 'Something went wrong with notifications API, bro!');
  }
}
