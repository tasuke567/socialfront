import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ,RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
      ]]
    });
  }

  get username() { return this.registerForm.get('username')!; }
  get email() { return this.registerForm.get('email')!; }
  get password() { return this.registerForm.get('password')!; }

  onRegister(): void {
    if (this.registerForm.invalid) {
      console.log('Invalid form:', this.registerForm.controls);
      this.markFormAsTouched();
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
    console.log('Registering user with data:', this.registerForm.value);  // ตรวจสอบข้อมูลที่ส่งไป
  
    this.authService.register(this.registerForm.value)
      .pipe(
        catchError((error) => {
          console.log('Registration error:', error);  // ดูข้อผิดพลาดจาก API
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((response) => {
        console.log('Registration response:', response);  // ตรวจสอบข้อมูลที่ได้จาก API
        if (response?.token) {
          this.authService.setToken(response.token);
          this.router.navigate(['/home']);
        }
      });
  }
  

  private markFormAsTouched(): void {
    Object.values(this.registerForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}