import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  tap,
} from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { FriendsApiService } from '../../../features/friends/services/friends-api.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full max-w-md mx-auto">
      <!-- Search Input -->
      <div class="relative">
        <input
          type="text"
          [formControl]="searchControl"
          placeholder="Search for users..."
          class="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            class="h-5 w-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="flex justify-center mt-4">
        <svg
          class="animate-spin h-6 w-6 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      </div>

      <!-- Search Results -->
      <div *ngIf="!loading && searchResults.length > 0" class="mt-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">
          Search Results:
        </h3>
        <ul class="space-y-2">
          <li
            *ngFor="let user of searchResults"
            class="p-3 bg-gray-50 rounded-lg shadow hover:bg-gray-100 transition flex items-center"
          >
            <!-- รูปโปรไฟล์ (Default ถ้าไม่มี) -->
            <img
              [src]="user.profilePicture || 'assets/default-avatar.png'"
              alt="{{ user.username }}'s avatar"
              class="h-10 w-10 rounded-full object-cover mr-3"
            />

            <!-- รายละเอียดผู้ใช้ -->
            <div>
              <p class="font-medium text-gray-800">{{ user.username }}</p>
              <p class="text-sm text-gray-500">
                {{ user.firstName }} {{ user.lastName }}
              </p>
            </div>

            <!-- ปุ่มตามสถานะ -->
            <div class="ml-auto">
              <button
                *ngIf="user.friendshipStatus === 'NONE'"
                (click)="sendFriendRequest(user.id)"
                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              >
                Add Friend
              </button>

              <button
                *ngIf="user.friendshipStatus === 'PENDING'"
                class="bg-yellow-500 text-white px-3 py-1 rounded cursor-not-allowed"
                disabled
              >
                Pending
              </button>

              <button
                *ngIf="user.friendshipStatus === 'ACCEPTED'"
                class="bg-gray-500 text-white px-3 py-1 rounded cursor-not-allowed"
                disabled
              >
                Friends
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- No Results -->
      <div
        *ngIf="!loading && searchControl.value && searchResults.length === 0"
        class="mt-4 text-gray-500 text-center"
      >
        No users found.
      </div>
    </div>
  `,
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() friendAdded = new EventEmitter<void>();
  @Output() addFriend = new EventEmitter<string>(); // ✅ ส่งค่าเป็น userId เท่านั้น


  searchControl: FormControl = new FormControl('');
  searchResults: User[] = [];
  loading: boolean = false;
  private searchSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private friendService: FriendsApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((query) => console.log('🔍 Search query changed:', query)),
        switchMap((query: string) => {
          const trimmedQuery = query.trim();
          if (!trimmedQuery) {
            console.log('🚨 Query is empty after trim, clearing results.');
            this.searchResults = [];
            return of([]);
          }
          this.loading = true;
          console.log('🌎 Calling searchUsers API with query:', trimmedQuery);
          return this.authService.searchUsers(trimmedQuery).pipe(
            tap((response) => console.log('📡 API response:', response)),
            finalize(() => {
              this.cdRef.detectChanges();
              this.loading = false;
              console.log('✅ API call finished. Loading set to false.');
            })
          );
        })
      )
      .subscribe({
        next: (response: any) => {
          this.searchResults = response.results || [];
          console.log('✅ Updated search results:', this.searchResults);
        },
        error: (err) => {
          console.error('❌ Error during search:', err);
          this.loading = false;
          this.searchResults = [];
        },
      });
  }

  // ✅ ฟังก์ชันสำหรับส่งคำขอเป็นเพื่อน + รีโหลดข้อมูล
  // ✅ ปรับให้รับ userId โดยตรง
  sendFriendRequest(userId: string): void {
    if (!userId) {
      console.error('❌ Invalid userId:', userId);
      return;
    }

    this.friendService.sendFriendRequest(userId).subscribe({
      next: () => {
        console.log(`✅ Friend request sent to ${userId}`);

        // อัปเดตสถานะของ user ที่ถูกเพิ่มเป็นเพื่อน -> PENDING
        const user = this.searchResults.find((u) => u.id === userId);
        if (user) {
          user.friendshipStatus = 'PENDING';
        }

        // แจ้งให้ component หลักโหลดข้อมูลใหม่
        this.friendAdded.emit();
      },
      error: (err) => console.error('❌ Error sending friend request:', err),
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}
