import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FriendsApiService } from '../../services/friends-api.service';
import { Friend } from '../../models';

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
}
