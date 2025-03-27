import { Component, OnInit, inject } from '@angular/core';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService } from '../../../../core/services/message.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  newMessage = '';
  
  // เปลี่ยนเป็น dynamic ได้ในอนาคต
  conversationId: string = ''; 
  senderId: string = '';
  receiverId: string = '';

  private wsService = inject(WebSocketService);
  private messagesService = inject(MessagesService);

  ngOnInit() {
    // TODO: กำหนดค่า conversationId, senderId, receiverId จาก route หรือ auth service
    this.conversationId = 'conv123'; // ตัวอย่าง placeholder
    this.senderId = 'user123';
    this.receiverId = 'user456';

    // subscribe ข้อความจาก WebSocket
    this.wsService.subscribeToMessages().subscribe((message: any) => {
      this.messages.push(message);
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
  
    const chatMessage = {
      conversationId: this.conversationId,
      senderId: this.senderId,
      receiverId: this.receiverId,
      content: this.newMessage,
      timestamp: new Date().toISOString(),
    };
  
    this.messagesService
      .sendMessage(chatMessage.conversationId, chatMessage.receiverId, chatMessage.content)
      .subscribe({
        next: (message) => {
          this.messages.push(message);
          this.newMessage = ''; // เคลียร์ช่องข้อความ
        },
        error: (err) => console.error('❌ ส่งข้อความไม่สำเร็จ:', err),
      });
  }
}
