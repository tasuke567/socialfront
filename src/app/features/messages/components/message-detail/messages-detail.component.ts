import { Component, OnInit, OnDestroy, Input, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, Subscription, take } from 'rxjs';

import {
  MessagesService,
  Message,
  Conversation,
} from '../../../../core/services/message.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { AuthService } from '../../../../core/services/auth.service';

/** interface สำหรับข้อความใน chat ที่เราต้องใช้งาน */
export interface ChatMessage {
  username: string;
  senderId: string;
  content: string;
  conversationId: string;
  createdAt?: Date;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-messages-detail',
  templateUrl: './messages-detail.component.html',
  styleUrls: ['./messages-detail.component.css'],
})
export class MessagesDetailComponent implements OnInit, OnDestroy {
  @Input() conversationId!: string;
  @Input() friendId!: string;

  messages: Message[] = [];
  newMessage: string = '';
  userId!: string; // user ที่ล็อกอินปัจจุบัน

  private wsSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private messagesService: MessagesService,
    private wsService: WebSocketService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // ตั้ง userId จาก AuthService
    this.userId = this.authService.getCurrentUser().id;
    console.log('🔑 Logged-in User ID:', this.userId);

    // subscribe paramMap เพื่อดึง conversationId จาก route
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const idParam = params.get('conversationId');
      if (!idParam) {
        console.error('🚨 Invalid conversationId:', idParam);
        return;
      }

      this.conversationId = idParam;
      console.log('🗄️ conversationId จาก route:', this.conversationId);

      // โหลดข้อความ + friendId
      this.loadMessages();

      // subscribe WebSocket (1 ครั้งพอ)
      this.wsService.connectionState$
        .pipe(
          filter((connected) => connected),
          take(1)
        )
        .subscribe(() => {
          console.log('✅ WebSocket is connected, now subscribe conversation');
          this.subscribeToNewMessages(); // ตอนนี้ได้ผล 100%
        });
    });
  }

  ngOnDestroy(): void {
    // unsubscribe กัน memory leak
    this.wsSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  /**
   * Subscribe WebSocket รับข้อความใหม่
   */
  subscribeToNewMessages(): void {
    console.log(
      '⏳ Subscribing WebSocket for conversation:',
      this.conversationId
    );
    // เรียกใช้ WebSocketService
    this.wsSubscription = this.wsService
      .subscribeToConversation(this.conversationId)
      .subscribe({
        next: (chatMsg: ChatMessage) => {
          console.log('📩 WebSocket received:', chatMsg);

          // ถ้าเป็นข้อความของห้องนี้
          if (chatMsg.conversationId === this.conversationId) {
            // push เข้า messages
            this.ngZone.run(() => {
              this.messages.push(chatMsg);
              this.scrollToBottom();
            });
          } else {
            console.warn('🔍 ไม่ใช่ข้อความของห้องนี้:', chatMsg.conversationId);
          }
        },
        error: (err) => {
          console.error('🚨 WebSocket error:', err);
        },
      });
  }

  /**
   * โหลดข้อความเก่าของห้อง + หาว่า friendId เป็นใคร
   */
  loadMessages(): void {
    // โหลดรายการข้อความ
    this.messagesService.getMessages(this.conversationId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        console.log('📜 Loaded messages:', this.messages);
      },
      error: (err) => {
        console.error('❌ Error loading messages:', err);
      },
    });

    // โหลด conversation list หา friendId
    this.messagesService.getUserConversations().subscribe({
      next: (conversations: Conversation[]) => {
        const current = conversations.find((c) => c.id === this.conversationId);
        if (current) {
          this.friendId =
            current.user1 === this.userId ? current.user2 : current.user1;
          console.log('🎯 Friend ID:', this.friendId);
        } else {
          console.error('❌ ไม่เจอ conversation:', this.conversationId);
        }
      },
      error: (err) => {
        console.error('❌ Error fetching conversations:', err);
      },
    });
  }

  /**
   * ส่งข้อความ
   */
  sendMessage(): void {
    if (!this.newMessage.trim()) {
      console.warn('⚠️ Empty message. Not sending.');
      return;
    }
    if (!this.friendId) {
      console.error('❌ ยังไม่มี friendId!');
      return;
    }

    this.messagesService
      .sendMessage(this.conversationId, this.friendId, this.newMessage)
      .subscribe({
        next: () => {
          console.log('✅ Message sent successfully!');
          // ถ้าอยากแสดงข้อความของตัวเองทันที ก็ push localTempMessage
          // แต่ถ้า backend broadcast กลับหาตัวเองอยู่แล้ว อาจไม่ต้องก็ได้

          this.newMessage = '';
        },
        error: (err) => {
          console.error('❌ Error sending message:', err);
        },
      });
  }

  /**
   * Scroll ให้เห็นข้อความล่าสุด
   */
  scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
