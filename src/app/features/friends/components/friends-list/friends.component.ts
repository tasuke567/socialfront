import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FriendsApiService } from '../../services/friends-api.service';
import { User } from '../../../../shared/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { lastValueFrom, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  tap,
} from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FriendRequest } from '../../models/friend-request.model';
import { SearchComponent } from '../../../../shared/components/search-user/searchuser.component';
import { IncomingRequestsComponent } from '../incoming-request/incoming-request.component';
import { MessagesService } from '../../../../core/services/message.service';
import { HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SearchComponent,
    IncomingRequestsComponent,
  ],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
})
export class FriendsComponent implements OnInit, OnDestroy {
  userId: string = '';
  friends: User[] = [];
  requestedFriends: Set<string> = new Set();
  searchQuery: string = '';
  searchResults: User[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  pendingRequests: FriendRequest[] = [];
  incomingRequests: FriendRequest[] = [];
  suggestions: User[] = [];
  showSuggestions: boolean = true;
  showPendingRequests: boolean = true;
  showFriends: boolean = true;
  showSearch: boolean = true;
  showIncomingRequests: boolean = true;
  visibleSuggestions: User[] = [];
  visiblePendingRequests: FriendRequest[] = [];
  visibleFriends: User[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  pageSize: number = 4;
  totalSuggestions: number = 0;

  // Pagination
  page: number = 0;

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  constructor(
    private friendService: FriendsApiService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser().id;
    this.setupSearchSubscription();
    this.refreshData('all');
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  isRequestSent(friendId: string): boolean {
    return this.requestedFriends.has(friendId);
  }

  sendFriendRequest(userId: string): void {
    this.friendService.sendFriendRequest(userId).subscribe({
      next: () => {
        this.requestedFriends.add(userId);
        this.successMessage = 'Friend request sent!';
        // อัปเดตสถานะ user เป็น PENDING ทันที
        const user = this.suggestions.find((u) => u.id === userId);
        if (user) {
          user.friendshipStatus = 'PENDING';
        }
        this.cdRef.detectChanges();
        this.refreshData('pendingRequests'); // โหลดเฉพาะ Pending Requests ใหม่
      },
      error: (error) => this.handleError(error, 'Error sending friend request'),
    });
  }

  removeFriend(friendId: string): void {
    this.setLoadingState(true);
    this.friendService
      .removeFriend(friendId)
      .pipe(finalize(() => this.setLoadingState(false)))
      .subscribe({
        next: () => this.refreshData(),
        error: (error) => this.handleError(error, 'Error removing friend'),
      });
  }

  searchFriends(): void {
    if (!this.searchQuery.trim()) {
      this.clearSearch();
      return;
    }
    this.searchSubject.next(this.searchQuery.trim());
  }

  private setupSearchSubscription(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => this.setLoadingState(true)),
        switchMap((query) =>
          this.authService
            .searchUsers(query)
            .pipe(finalize(() => this.setLoadingState(false)))
        )
      )
      .subscribe({
        next: (response: any) => {
          this.searchResults = response.users || [];
          this.successMessage = response.message || '';
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (error) => this.handleError(error, 'Error searching friends'),
      });
  }

  acceptFriendRequest(requestId: string): void {
    this.friendService.acceptFriendRequest(requestId).subscribe({
      next: () => {
        this.refreshData();
        this.loadIncomingRequests();
      },
      error: (err) => this.handleError(err, 'Failed to accept request'),
    });
  }

  declineFriendRequest(requestId: string): void {
    this.friendService.declineFriendRequest(requestId).subscribe({
      next: () => {
        this.refreshData();
        this.loadIncomingRequests();
      },
      error: (err) => this.handleError(err, 'Failed to decline request'),
    });
  }

  cancelRequest(userId: string): void {
    this.friendService.cancelFriendRequest(userId).subscribe({
      next: () => {
        console.log(`✅ Canceled friend request for user ${userId}`);
        // อัปเดตค่า friendshipStatus ใน searchResults
        this.searchResults = this.searchResults.map((user) =>
          user.id === userId ? { ...user, friendshipStatus: 'NONE' } : user
        );
        // แจ้งเตือนเล็กน้อย (ถ้าต้องการ)
        this.successMessage = 'Friend request canceled, chill out!';
        setTimeout(() => (this.successMessage = ''), 3000);
        // โหลดข้อมูลใหม่เฉพาะส่วน pending และ search results
        this.refreshData('pendingRequests');
        this.refreshData('searchResults');
        this.cdRef.detectChanges();
      },
      error: (err) => this.handleError(err, 'Failed to cancel request'),
    });
  }

  public loadFriends(): void {
    this.setLoadingState(true);
    this.friendService
      .getFriends()
      .pipe(finalize(() => this.setLoadingState(false)))
      .subscribe({
        next: (response: User[]) => (this.friends = response),
        error: (error) => this.handleError(error, 'Error loading friends'),
      });
    this.showFriends = true;
  }

  loadSuggestions(): void {
    this.friendService.getFriendSuggestions().subscribe((suggestions) => {
      this.suggestions = suggestions;
      this.totalSuggestions = this.suggestions.length;
      this.totalPages = Math.ceil(this.totalSuggestions / this.pageSize);

      this.currentPage = 1; // รีเซ็ตไปหน้าแรกทุกครั้งที่โหลดใหม่
      this.updateVisibleSuggestions();
    });
  }

  private loadPendingRequests(): void {
    this.setLoadingState(true);
    this.friendService
      .getPendingRequests()
      .pipe(finalize(() => this.setLoadingState(false)))
      .subscribe({
        next: (requests: FriendRequest[]) => (
          (this.pendingRequests = requests), (this.showPendingRequests = true)
        ),

        error: (error) =>
          this.handleError(error, 'Error loading pending requests'),
      });
  }
  private loadIncomingRequests(): void {
    this.setLoadingState(true);
    this.friendService
      .getRequests()
      .pipe(finalize(() => this.setLoadingState(false)))
      .subscribe({
        next: (requests: FriendRequest[]) => (
          (this.incomingRequests = requests), (this.showIncomingRequests = true)
        ),

        error: (error) =>
          this.handleError(error, 'Error loading pending requests'),
      });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.searchFriends();
    this.refreshData();
  }

  onClear(): void {
    this.clearSearch();
    this.refreshData();
  }

  private clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisibleSuggestions();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateVisibleSuggestions();
    }
  }

  updateVisibleSuggestions(): void {
    // ป้องกันค่าเกินขอบเขต
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.visibleSuggestions = this.suggestions.slice(startIndex, endIndex);

    this.cdRef.detectChanges();
  }

  public refreshData(...targets: string[]): void {
    const updates = new Set(targets);

    if (updates.has('friends')) this.loadFriends();
    if (updates.has('suggestions')) this.loadSuggestions();
    if (updates.has('pendingRequests')) this.loadPendingRequests();
    if (updates.has('incomingRequests')) this.loadIncomingRequests();
    if (updates.has('searchResults')) this.searchFriends();

    if (updates.size === 0 || updates.has('all')) {
      this.loadFriends();
      this.loadSuggestions();
      this.loadPendingRequests();
      this.loadIncomingRequests();
      this.searchFriends();
    }

    this.cdRef.detectChanges();
  }

  private setLoadingState(isLoading: boolean, message: string = ''): void {
    this.loading = isLoading;
    if (!isLoading) {
      this.successMessage = message;
      setTimeout(() => (this.successMessage = ''), 3000);
    }
  }

  private handleError(error: any, defaultMessage: string): void {
    console.error('❌', defaultMessage, error);

    this.errorMessage = `${defaultMessage}: ${
      error?.message || error?.error?.message || JSON.stringify(error)
    }`;

    setTimeout(() => {
      if (
        this.errorMessage ===
        `${defaultMessage}: ${
          error?.message || error?.error?.message || JSON.stringify(error)
        }`
      ) {
        this.errorMessage = '';
      }
    }, 3000);
  }

  async openChat(friendId: string) {
    try {
      const conversationId = await lastValueFrom(this.messagesService.getOrCreateConversation(friendId));
      if (!conversationId) {
        console.error('Error: conversationId is undefined or null');
        return;
      }
      this.router.navigate(['/messages', conversationId]);
    } catch (error) {
      console.error('❌ Oops! Error opening chat:', error);
    }
  }
}
