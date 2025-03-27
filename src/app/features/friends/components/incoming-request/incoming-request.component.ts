import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FriendsApiService } from '../../services/friends-api.service';
import { FriendRequest } from '../../models/friend-request.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-incoming-requests',
  template: `
    <div class="container mx-auto">
      <h3 class="text-xl font-semibold mb-4">
        Friend Requests ({{ incomingRequests.length }})
      </h3>

      <ul *ngIf="incomingRequests.length > 0" class="space-y-3">
        <li
          *ngFor="let request of incomingRequests"
          class="flex items-center justify-between bg-gray-50 p-3 rounded shadow hover:bg-gray-100 transition"
        >
          <div class="flex items-center">
            <img
              *ngIf="request.profilePicture"
              [src]="request.profilePicture"
              alt="{{ request.username }}'s profile picture"
              class="h-10 w-10 rounded-full mr-3 object-cover"
            />
            <span class="text-gray-800 font-medium">
              {{ request.username }}
            </span>
          </div>
          <div class="space-x-2">
            <button
              (click)="onAcceptRequest(request.id)"
              class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
            >
              Accept
            </button>
            <button
              (click)="onDeclineRequest(request.id)"
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Decline
            </button>
          </div>
        </li>
      </ul>

      <p *ngIf="incomingRequests.length === 0" class="text-gray-600">
        No incoming friend requests.
      </p>
    </div>
  `,
  styles: [],
})
export class IncomingRequestsComponent implements OnInit {
  incomingRequests: FriendRequest[] = [];

  @Output() acceptRequest = new EventEmitter<string>(); // ✅ ส่ง requestId ไปให้ Parent Component
  @Output() declineRequest = new EventEmitter<string>(); // ✅ ส่ง requestId ไปให้ Parent Component

  constructor(private friendService: FriendsApiService) {}

  ngOnInit(): void {
    this.loadIncomingRequests();
  }

  loadIncomingRequests(): void {
    this.friendService.getRequests().subscribe({
      next: (requests: FriendRequest[]) => {
        this.incomingRequests = requests;
      },
      error: (error) => {
        console.error('Error loading incoming friend requests', error);
      },
    });
  }

  onAcceptRequest(requestId: string): void {
    this.acceptRequest.emit(requestId); // ✅ ส่ง Event ไปยัง Parent Component
    
  }

  onDeclineRequest(requestId: string): void {
    this.declineRequest.emit(requestId); // ✅ ส่ง Event ไปยัง Parent Component

  }
}
