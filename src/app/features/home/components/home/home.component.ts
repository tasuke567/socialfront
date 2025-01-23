import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { PostsComponent } from '../../../../components/posts/posts/posts.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostsComponent], // Add CommonModule to imports
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to the login status
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.router.navigate(['/post']); // Navigate to PostsComponent if logged in
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']); // Navigate to login page if not logged in
  }
}
