import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessagesService } from '../../../../core/services/message.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Messages</h2>
      <div *ngIf="loading">Loading messages...</div>
      <div *ngIf="!loading && messages.length > 0">
        <div *ngFor="let message of messages">
          <p><strong>{{ message.senderId }}:</strong> {{ message.content }}</p>
        </div>
      </div>
      <div *ngIf="!loading && messages.length === 0">No messages found.</div>
    </div>
  `,
})
export class MessagesComponent implements OnInit {
  loading = true;
  messages: any[] = [];
  @Output() conversationId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private messagesService: MessagesService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.conversationId = params.get('conversationId');

      if (!this.conversationId) {
        console.error('🚨 Missing conversationId in route');
        return;
      }

      this.messagesService.getMessages(this.conversationId).subscribe((msgs) => {
        this.messages = msgs;
        this.loading = false;
      });
    });
  }
}
