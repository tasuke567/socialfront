import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfilePictureComponent } from '../../../../shared/components/profile-picture/profile-picture.component';
import { UserProfile } from './../../../../core/models/user-profile.model';
@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfilePictureComponent],
  template: `
    <div
      class="mb-8 p-6 bg-white shadow-xl rounded-xl max-w-2xl mx-auto border border-gray-200 transition-transform duration-300"
    >
      <!-- User Profile Section -->
      <div class="flex items-center gap-3 mb-4">
        <app-profile-picture
          [profileUrl]="user?.profilePicture ?? null"
          [username]="user?.username || 'Unknown User'"
          [size]="'5'"
        >
        </app-profile-picture>

        <span class="text-lg font-semibold text-gray-700">{{
          currentUser
        }}</span>
      </div>
      <!-- Add Title Input -->
      <input
        type="text"
        [(ngModel)]="newPostTitle"
        placeholder="Post title"
        aria-label="Post title"
        class="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm hover:shadow-md"
      />
      <!-- Post Content Input -->
      <textarea
        [(ngModel)]="newPostContent"
        placeholder="What's on your mind?"
        rows="4"
        aria-label="Post content"
        class="w-full border border-gray-300 rounded-lg p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm hover:shadow-md"
      >
      </textarea>
      <!-- Submit Button -->
      <button
        (click)="handlePost()"
        [disabled]="isLoading || !newPostContent.trim() || !newPostTitle.trim()"
        class="w-full bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <ng-container *ngIf="isLoading; else postLabel">
          <svg
            class="animate-spin inline-block h-5 w-5 mr-2 text-white"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Posting...
        </ng-container>
        <ng-template #postLabel>Create Post</ng-template>
      </button>
    </div>
  `,
})
export class PostFormComponent {
  @Input() currentUserProfileUrl?: string;
  @Input() currentUser?: string;
  @Input() isLoading = false;
  @Output() onPost = new EventEmitter<{ title: string; content: string }>();
  @Input() user?: UserProfile | null;

  newPostTitle = '';
  newPostContent = '';

  handlePost(): void {
    if (this.newPostTitle.trim() && this.newPostContent.trim()) {
      this.onPost.emit({
        title: this.newPostTitle.trim(),
        content: this.newPostContent.trim(),
      });
      this.newPostTitle = '';
      this.newPostContent = '';
    }
  }
}
