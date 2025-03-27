import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

// Interfaces สำหรับ Conversation และ Message
export interface Conversation {
  id: string;
  user1: string;
  user2: string;
  createdAt?: Date;
}

export interface Message {
  username: string;
  senderId: string;
  content: string;
  conversationId: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private apiUrl = 'http://localhost:8080/api/messages';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private handleError(error: any) {
    console.error('🔥 API Error:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }

  // ดึงรายชื่อแชททั้งหมด
  getUserConversations(): Observable<Conversation[]> {
    return this.http
      .get<Conversation[]>(`${this.apiUrl}/conversations`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getConversationID(): Observable<Conversation[]> {
    return this.http
      .get<Conversation[]>(`${this.apiUrl}/conversation`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ดึงข้อความจาก conversationId
  getMessages(conversationId: string): Observable<Message[]> {
    return this.http
      .get<Message[]>(`${this.apiUrl}/${conversationId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // **ส่งข้อความ**
  sendMessage(
    conversationId: string,
    receiverId: string,
    content: string
  ): Observable<any> {
    if (!conversationId) {
      console.error('🚨 ต้องระบุ conversationId ทุกครั้งที่ส่งข้อความ!');
      return throwError(() => new Error('Missing conversationId'));
    }

    const body = { conversationId, receiverId, content };

    return this.http
      .post<Message>(`${this.apiUrl}/send`, body, {
        headers: this.getHeaders(),
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return response.body || {};
        }),
        catchError(this.handleError)
      );
  }

  // ลบข้อความของตัวเอง
  deleteMessage(messageId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${messageId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ✅ เพิ่มฟังก์ชัน Get หรือสร้าง Conversation พร้อมแนบ Token
  getOrCreateConversation(friendId: string): Observable<string> {
    return this.http
      .post<{ conversationId: string }>(
        `${this.apiUrl}/conversation`,
        { friendId },
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => response.conversationId) // ✅ ดึงค่า conversationId ออกมา
      );
  }
}
