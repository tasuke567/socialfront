import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReactiveFormsModule,FormGroup ,FormBuilder} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { UserProfile } from './core/models/user-profile.model';
import { ProfilePictureComponent } from './shared/components/profile-picture/profile-picture.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule ,ProfilePictureComponent ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // isLoggedIn$ is an Observable that tracks the login status.
  isLoggedIn$ = this.authService.isLoggedIn$;
  loggedInUsername: string = '';
  userProfile$ = this.authService.userProfile$;

  user: UserProfile | null = null;
  isLoading = false;
  errorMessage = '';
  accountCreated?: Date;
  lastUpdated?: Date;


  constructor(private authService: AuthService, private router: Router , private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    // Check authentication status when the application starts.
    this.authService.checkAuthStatus();
    // Get the username from AuthService (fallback to 'Guest' if not logged in)
    this.fetchUserProfile();

    this.loggedInUsername = this.authService.getUsername() || 'Guest';
  }

  /** โหลดข้อมูลโปรไฟล์จาก API */
  fetchUserProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.accountCreated = profile.createdAt
          ? new Date(profile.createdAt)
          : undefined;
        this.lastUpdated = profile.updatedAt
          ? new Date(profile.updatedAt)
          : undefined;

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching profile', error);
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้';
        this.isLoading = false;
      },
    });
  }


  /**
   * Logs out the user by calling authService.logout() and navigates to the root path.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
