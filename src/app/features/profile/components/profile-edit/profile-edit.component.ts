import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfile } from '../../../../core/models/user-profile.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
})
export class ProfileEditComponent implements OnInit {
  editForm!: FormGroup;
  user!: UserProfile;
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null; // ✅ เก็บไฟล์ที่เลือก

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.initializeForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile.';
        this.isLoading = false;
      }
    });
  }

  private initializeForm(): void {
    if (!this.user) return;

    this.editForm = this.fb.group({
      username: [{ value: this.user.username, disabled: true }, [Validators.required]],
      firstName: [this.user.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [this.user.lastName || '', [Validators.required, Validators.minLength(2)]],
      profilePicture: [this.user.profilePicture || ''], // ✅ ใช้ URL ของรูป
    });
  }

  /** ✅ เมื่อเลือกไฟล์รูป */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
  
      // ใช้ FileReader เพื่อสร้าง preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // update form control 'profilePicture' ด้วย preview URL
        this.editForm.patchValue({
          profilePicture: e.target.result
        });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  

  /** ✅ อัปโหลดรูปพร้อมอัปเดตข้อมูลโปรไฟล์ */
  onSubmit(): void {
    if (this.editForm.invalid) return;
  
    this.isLoading = true;
    this.errorMessage = '';
  
    const formData = new FormData();

    // ✅ ส่ง JSON เป็น `Blob` ใน `FormData`
    const userProfile = {
      firstName: this.editForm.get('firstName')?.value,
      lastName: this.editForm.get('lastName')?.value,
      profilePicture: this.editForm.get('profilePicture')?.value,
    };
    formData.append('userProfile', new Blob([JSON.stringify(userProfile)], { type: 'application/json' }));

    // ✅ ถ้ามีไฟล์แนบ ส่งไปพร้อมกัน
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }
  
    // ✅ ใช้ `formData` ส่งไปยัง API
    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.router.navigate(['/profile', this.user.username]);
      },
      error: (error) => {
        console.error('Update failed:', error);
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
