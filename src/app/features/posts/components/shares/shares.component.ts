import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharesService } from '../../../../core/services/shares.service';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 text-gray-600">
      <button 
        (click)="handleShare()"
        [disabled]="loading"
        class="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>
      <span class="text-sm">{{ shareCount }}</span>
      <div *ngIf="error" class="text-red-500 text-sm">{{ error }}</div>
    </div>
  `
})
export class SharesComponent {
  @Input() postId = '';
  @Input() shareCount = 0;
  @Output() shared = new EventEmitter<string>();
  
  loading = false;
  error: string | null = null;
  isShared = false;

  constructor(
    private sharesService: SharesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.sharesService.getShareCount(this.postId).subscribe(count => {
      this.shareCount = count;
    });
    
    this.sharesService.checkShareStatus(this.postId).subscribe({
      next: (response: { shared: boolean }) => {
        this.isShared = response.shared;
      },
      error: (err) => {
        console.error('Error checking share status:', err);
      }
    });
  }

  // ============================================
  // Share Functions
  // ============================================   
  handleShare() {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to share this post');
      return;
    }

    this.loading = true;
    this.error = null;

    const shareAction = this.isShared 
      ? this.sharesService.deletePostShare(this.postId)
      : this.sharesService.sharePost(this.postId);

    shareAction
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.shareCount = response.shareCount;
            this.isShared = !this.isShared;
            this.shared.emit(this.postId);
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Failed to share post';
        }
      });
  }
}
