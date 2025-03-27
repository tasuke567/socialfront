import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfile } from '../../../core/models/user-profile.model';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: UserProfile | null = null;
  isLoading = false;
  errorMessage = '';
  accountCreated?: Date;
  lastUpdated?: Date;
  editForm!: FormGroup;


  constructor(private authService: AuthService, private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.fetchUserProfile();
    this.initializeForm();
  }

  /** โหลดข้อมูลโปรไฟล์จาก API */
  fetchUserProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.accountCreated = profile.createdAt ? new Date(profile.createdAt) : undefined;
        this.lastUpdated = profile.updatedAt ? new Date(profile.updatedAt) : undefined;
        this.editForm.patchValue(profile); // ✅ กรอกค่าในฟอร์มอัตโนมัติ
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching profile', error);
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้';
        this.isLoading = false;
      },
    });
  }

  /** กำหนดค่าเริ่มต้นให้ `FormGroup` */
  private initializeForm(): void {
    this.editForm = this.fb.group({
      profilePicture: ['']
    });
  }

  /** อัปโหลดรูปโปรไฟล์ */
  handleUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    this.http.post<{ url: string }>('http://localhost:8080/upload', formData, { headers }).subscribe({
      next: (res) => {
        const cleanUrl = res.url.replace(/\/+$/, ""); // ✅ ลบ `/` ที่ท้าย URL
        this.editForm.patchValue({ profilePicture: cleanUrl }); // ✅ ใช้ URL ที่ถูกต้อง
        if (this.user) this.user.profilePicture = cleanUrl;
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.errorMessage = 'อัปโหลดรูปไม่สำเร็จ';
      }
    });
  }
}
