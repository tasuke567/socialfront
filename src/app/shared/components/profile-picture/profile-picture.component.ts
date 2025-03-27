import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600"
      [ngStyle]="{ width: size + 'rem', height: size + 'rem' ,} "
    >
      <img
        *ngIf="profileUrl; else noImage"
        [src]="profileUrl"
        [alt]="username + ' profile picture'"
        class="w-full h-full object-cover"
      />
      <ng-template #noImage>
        <div
          class="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500"
        >
          <span>No Image</span>
        </div>
      </ng-template>
    </div>
  `,
})
export class ProfilePictureComponent {
  @Input() profileUrl: string | null = null;
  @Input() username: string = ''; // ค่า default สำหรับชื่อผู้ใช้
  @Input() size: string = '5'; // ค่า default สำหรับขนาด (ใช้ Tailwind classes: w-10 h-10)

  // คำนวณคลาสพื้นฐานตามขนาดที่ระบุ
  get computedClasses(): string {
    return `w-${this.size} h-${this.size} `;
  }

  // ดึงตัวอักษรตัวแรกของชื่อผู้ใช้ (หรือ '?' ถ้าไม่มีข้อมูล)
  getInitial(): string {
    return this.username && this.username.length > 0
      ? this.username.charAt(0).toUpperCase()
      : '?';
  }
}
