// src/app/features/friends/components/friends.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FriendsApiService } from '../../services/friends-api.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
})
export class FriendsComponent implements OnInit {
  userId: string = '1'; // Replace with actual user ID from auth or session
  friends: User[] = [];
  requestedFriends: Set<string> = new Set();
  searchQuery: string = '';
  searchResults: User[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  isRequestSent(friendId: string): boolean {
    return this.requestedFriends.has(friendId);
  }
  

  constructor(private friendService: FriendsApiService) {}

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends(): void {
    this.setLoadingState(true);
    this.friendService.getFriends(this.userId).subscribe(
      (response: User[]) => {
        this.friends = response; // Populate friends list
        this.setLoadingState(false, 'Friends loaded successfully.');
      },
      (error) => this.handleError(error, 'Error loading friends')
    );
  }

  addFriend(friendId: string): void {
    this.setLoadingState(true);
    this.friendService.addFriend(this.userId, friendId).subscribe(
      () => {
        this.successMessage = 'Friend added successfully!';
        this.loadFriends(); // Refresh friends list after adding
      },
      (error) => this.handleError(error, 'Error adding friend')
    );
  }

  removeFriend(friendId: string): void {
    this.setLoadingState(true);
    this.friendService.removeFriend(this.userId, friendId).subscribe(
      () => {
        this.successMessage = 'Friend removed successfully!';
        this.loadFriends(); // Refresh friends list after removal
      },
      (error) => this.handleError(error, 'Error removing friend')
    );
  }

  sendFriendRequest(friendId: string): void {
    this.setLoadingState(true);
    this.friendService.sendFriendRequest(this.userId, friendId).subscribe(
      () => {
        this.requestedFriends.add(friendId);
        this.successMessage = 'Friend request sent!';
      },
      (error) => this.handleError(error, 'Error sending friend request')
    );
  }

  searchFriends(): void {
    this.setLoadingState(true);
    this.friendService.searchUsers(this.searchQuery).subscribe(
      (users: User[]) => {
        this.searchResults = users;
        this.setLoadingState(false);
      },
      (error) => this.handleError(error, 'Error searching friends')
    );
  }

  // Helper methods
  setLoadingState(isLoading: boolean, message: string = ''): void {
    this.loading = isLoading;
    if (!isLoading) {
      this.successMessage = message;
      this.errorMessage = '';
      setTimeout(() => {
        this.successMessage = ''; // Clear success message after 3 seconds
      }, 3000);
    }
  }

  handleError(error: any, defaultMessage: string): void {
    console.error(defaultMessage, error);
    this.errorMessage =
      defaultMessage + ': ' + (error?.message || error?.error?.message || error);
    this.successMessage = '';
    this.loading = false;
  }
}
