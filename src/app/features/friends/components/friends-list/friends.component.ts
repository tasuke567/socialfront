import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FriendsApiService } from '../../services/friends-api.service';
import { Friend } from '../../models';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
})
export class FriendsComponent {
  friends: Friend[] = [];
  userId: string = '1';
  newFriendId: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  searchQuery: string = ''; // คำค้นหา
  requestedFriends: Set<string> = new Set();
  searchResults: User[] = [];

  constructor(private friendService: FriendsApiService) {}

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends(): void {
    this.setLoadingState(true);
    this.friendService.getFriends(this.userId).subscribe(
      (response: any) => {
        if (Array.isArray(response.friends)) {
          // กรองตัวเองออกจากรายชื่อเพื่อน
          this.friends = response.friends.filter(
            (friend: Friend) => friend.id !== this.userId
          );

          // Sorting friends by id
          // Add sorting logic here

          this.setLoadingState(false, 'Friends loaded successfully.');
        } else {
          this.friends = [];
          this.handleError(
            null,
            'Unexpected data format received while loading friends'
          );
        }
      },
      (error) => this.handleError(error, 'Error loading friends')
    );
  }

  addFriend(): void {
    if (!this.newFriendId) return;

    this.setLoadingState(true);
    this.friendService.addFriend(this.userId, this.newFriendId).subscribe(
      () => {
        this.successMessage = 'Friendship created successfully.';
        this.newFriendId = ''; // รีเซ็ต input
        this.loadFriends(); // รีเฟรชเพื่อน
      },
      (error) => this.handleError(error, 'Error adding friend')
    );
  }

  unfriend(friendId: string): void {
    this.setLoadingState(true);
    this.friendService.unfriend(this.userId, friendId).subscribe(
      (response: any) => {
        this.successMessage = response?.message || 'Unfriend successful.';
        this.loadFriends(); // รีเฟรชเพื่อนหลังจากลบเพื่อน
      },
      (error: any) => {
        this.handleError(error, 'Error unfriending friend');
      }
    );
  }

  private setLoadingState(isLoading: boolean, message: string = ''): void {
    this.loading = isLoading;
    if (!isLoading) {
      this.successMessage = message;
      this.errorMessage = '';
      setTimeout(() => {
        this.successMessage = ''; // Clear success message after 3 seconds
      }, 3000);
    }
  }

  private handleError(error: any, defaultMessage: string): void {
    console.error(defaultMessage, error);
    this.errorMessage =
      defaultMessage +
      ': ' +
      (error?.message || error?.error?.message || error);
    this.successMessage = '';
    this.loading = false;
  }
  sortFriendsByName(): void {
    this.friends.sort((a, b) => {
      if (a.name && b.name) {
        return a.name.localeCompare(b.name);
      }
      return 0; // If name is not defined, don't alter the order
    });
  }
  // เรียงเพื่อนตาม ID
  // ตรวจสอบให้แน่ใจว่า ID ของเพื่อนเป็นชนิด 'number'
  sortFriendsById() {
    // ตรวจสอบว่า id เป็น number ก่อนทำการคำนวณ
    this.friends.sort((a, b) => {
      const idA = typeof a.id === 'number' ? a.id : parseInt(a.id, 10);
      const idB = typeof b.id === 'number' ? b.id : parseInt(b.id, 10);

      return idA - idB;
    });
  }
  // ฟังก์ชันค้นหาเพื่อน
  searchFriends(query: string ): void {
    this.friendService.searchUsers(query).subscribe((users) => {
      this.searchResults = users;
    });
  }
  // Mark a friend request as sent
  sendFriendRequest(friendId: string) {
    this.requestedFriends.add(friendId);
  }

  // Check if a friend request has been sent
  isRequestSent(friendId: string): boolean {
    return this.requestedFriends.has(friendId);
  }
}
