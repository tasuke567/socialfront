import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../../../core/services/Notifications.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Notifications</h2>
      <div *ngIf="loading">Loading notifications...</div>
      <div *ngIf="error" class="text-red-500">{{ error }}</div>
      <div *ngIf="!loading && !error">
        <div *ngFor="let notification of notifications" class="border-b py-2">
          <p class="text-gray-700">{{ notification.message }}</p>
          <small class="text-gray-500 text-xs">{{ notification.createdAt | date }}</small>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  loading = false;
  error = '';
  notifications: any[] = [];

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  private loadNotifications() {
    this.loading = true;
    this.notificationsService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load notifications';
        this.loading = false;
      }
    });
  }
} 