import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '../../../../features/posts/models/post.model';
import { ProfilePictureComponent } from '../../../../shared/components/profile-picture/profile-picture.component';
import { CommentsService } from '../../../../core/services/comments.service';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfilePictureComponent, ConfirmDeleteModalComponent],
  template: `
    <div class="comment-section mt-4">
      <!-- ช่องใส่คอมเมนต์ -->
      <textarea 
        [(ngModel)]="newCommentText" 
        placeholder="Write a comment..." 
        rows="3"
        (keydown.enter)="handleCommentSubmit($any($event))"
        class="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      ></textarea>
      
      <!-- ปุ่มโพสต์คอมเมนต์ -->
      <button 
        (click)="handleCommentSubmit()"
        [disabled]="!newCommentText.trim()"
        class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
        Comment
      </button>

      <!-- แสดงรายการคอมเมนต์ -->
      <div *ngIf="loading">Loading comments...</div>
      <div *ngIf="error" class="text-red-500">{{ error }}</div>
      <div *ngIf="!loading && !error">
        <div *ngIf="comments?.length; else noComments" class="mt-4">
          <div *ngFor="let comment of comments" class="mb-2 border-b border-gray-200 pb-2 flex gap-3">
            <app-profile-picture 
              [profileUrl]="comment.profile_picture || ''" 
              [username]="comment.username || 'Anonymous'" 
              size="8">
            </app-profile-picture>
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <p class="text-sm text-gray-700">
                  <span class="font-medium">{{ comment.username || 'Anonymous' }}:</span>
                  {{ comment.content || 'No content' }}
                </p>
                <button 
                  *ngIf="currentUsername === comment.username"
                  (click)="deleteComment(comment.id)"
                  class="text-red-500 hover:text-red-700 text-xs ml-2"
                >
                  Delete
                </button>
              </div>
              <small class="text-gray-500 text-xs">{{ formatRelativeTime(comment.created_at) }}</small>
            </div>
          </div>
        </div>

        <!-- ถ้าไม่มีคอมเมนต์ -->
        <ng-template #noComments>
          <div class="mt-4 text-gray-500 italic">No comments yet.</div>
        </ng-template>
      </div>

      <app-confirm-delete-modal 
        *ngIf="isDeleteModalVisible" 
        (confirm)="confirmDelete()" 
        (cancel)="cancelDelete()">
      </app-confirm-delete-modal>
    </div>
  `
})
export class CommentsComponent implements OnInit {
  @Input() postId = '';
  @Output() onSubmit = new EventEmitter<{ postId: string; commentText: string }>();
  
  newCommentText = '';
  comments: Comment[] = [];
  loading = false;
  error: string | null = null;
  currentUsername = '';
  isDeleteModalVisible = false;
  commentToDeleteId: string | null = null;

  constructor(
    private commentsService: CommentsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.currentUsername = currentUser?.username || '';
    this.fetchComments();
  }

  private fetchComments() {
    this.loading = true;
    this.error = null;
    
    this.commentsService.getCommentsByPost(this.postId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.comments = response.map(dto => ({
            ...dto,
            username: dto.username || 'Anonymous',
            post_id: dto.postId,
            user_id: dto.userId,
            created_at: new Date(dto.createdAt),
          }));
        },
        error: (err) => {
          this.error = 'Failed to load comments';
        }
      });
  }

  handleCommentSubmit(event?: KeyboardEvent) {
    if (event) event.preventDefault();
    if (!this.newCommentText.trim()) return;

    this.loading = true;
    this.commentsService.commentOnPost(this.postId, this.newCommentText.trim())
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (newComment) => {
          this.comments = [{
            ...newComment,
            post_id: newComment.postId,
            user_id: newComment.userId,
            created_at: new Date(newComment.createdAt),
            username: newComment.username || this.currentUsername || 'Anonymous'
          }, ...this.comments];
          this.newCommentText = '';
        },
        error: (err) => {
          this.error = 'Failed to post comment';
        }
      });
  }

  formatRelativeTime(createdAt: Date): string {
    return formatDistanceToNow(createdAt, { addSuffix: true });
  }

  deleteComment(commentId: string) {
    this.commentToDeleteId = commentId;
    this.isDeleteModalVisible = true;
  }

  confirmDelete() {
    if (this.commentToDeleteId) {
      this.loading = true;
      this.commentsService.deleteComment(this.commentToDeleteId)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.comments = this.comments.filter(c => c.id !== this.commentToDeleteId);
            this.commentToDeleteId = null;
            this.isDeleteModalVisible = false;
          },
          error: (err) => {
            console.error('Failed to delete comment:', err);
            this.error = 'Failed to delete comment. Please try again later.';
            this.isDeleteModalVisible = false;
          }
        });
    }
  }

  cancelDelete() {
    this.isDeleteModalVisible = false;
    this.commentToDeleteId = null;
  }
}
