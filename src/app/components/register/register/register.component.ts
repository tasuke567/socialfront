import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    const user = { name: this.name, email: this.email, password: this.password };

    this.authService.register(user).subscribe(
      (response) => {
        this.authService.setToken(response.token);  // เก็บ JWT ใน localStorage
        this.router.navigate(['/home']);  // ไปยังหน้าหลักหลังจากลงทะเบียนสำเร็จ
      },
      (error) => {
        this.errorMessage = 'Registration failed, please try again.';
        console.error('Error during registration:', error);
      }
    );
  }
}
