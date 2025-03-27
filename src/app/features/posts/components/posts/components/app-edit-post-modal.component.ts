import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Post } from '../../../models/post.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-edit-post-modal',
  templateUrl: './app-edit-post-modal.component.html',
  styles: ['']
})
export class EditPostModalComponent implements OnInit, OnChanges {
  @Input() post!: Post;
  @Input() showEditModal = false;

  @Output() save = new EventEmitter<Post>();
  @Output() cancel = new EventEmitter<void>();

  // Clone the post to avoid modifying the original until save
  editedPost!: Post;

  ngOnInit(): void {
    if (this.post) {
      this.editedPost = { ...this.post };
    }
  }

  constructor(private cdRef: ChangeDetectorRef) {}

  // Reset editedPost if input post changes
 ngOnChanges(changes: SimpleChanges): void {
  if (changes['post'] && changes['post'].currentValue) {
    this.editedPost = { ...changes['post'].currentValue };
    this.cdRef.detectChanges()
  }
}

  onSave(): void {
    this.save.emit(this.editedPost);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
