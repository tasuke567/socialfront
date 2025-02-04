import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor() {
    this.loginForm = this.fb.group({
      // Use email validator or custom pattern for username
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{3,20}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get username() { return this.loginForm.get('username')!; }
  get password() { return this.loginForm.get('password')!; }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value)
      .pipe(
        catchError((error) => {
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((response) => {
        if (response?.token) {
          this.authService.setToken(response.token);
          this.router.navigate(['/']);
        }
      });
  }

  private markFormAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}