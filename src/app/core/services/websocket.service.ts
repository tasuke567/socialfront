import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, ReplaySubject } from 'rxjs';
import { AuthService } from './auth.service';
import { ChatMessage } from '../../features/messages/components/message-detail/messages-detail.component';
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private client: Client;
  public connected: boolean = false;
  private connectionSubject = new ReplaySubject<boolean>(1); // เก็บสถานะ WebSocket
  public connectionState$ = new ReplaySubject<boolean>(1);
  constructor(private authService: AuthService, private ngZone: NgZone) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      reconnectDelay: 5000,
      debug: (msg) => console.log(`🛜 WebSocket Debug: ${msg}`),
      connectHeaders: this.getAuthHeaders(),
    });

    this.client.onConnect = () => {
      this.connected = true;
      this.connectionState$.next(true);
      this.connectionSubject.next(true); // แจ้งว่า WebSocket พร้อมแล้ว
      console.log('✅ WebSocket Connected!');
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      this.connectionSubject.next(false); // แจ้งว่า WebSocket หลุด
      console.warn('❌ WebSocket Disconnected!');
    };

    this.client.activate();
  }

  /**
   * Subscribe ไปยัง WebSocket เมื่อเชื่อมต่อแล้ว
   */
  subscribeToConversation(convId: string): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      const subscription = this.client.subscribe(
        `/topic/conversation/${convId}`,
        (stompMessage: IMessage) => {
          
          // แปลง body เป็น ChatMessage
          const parsed: ChatMessage = JSON.parse(stompMessage.body);
          observer.next(parsed);
        }
      );
      return () => subscription.unsubscribe();
    });
  }
  
  

  private getAuthHeaders(): { [key: string]: string } {
    const token = this.authService.getToken();
    return { Authorization: `Bearer ${token}` };
  }
}
