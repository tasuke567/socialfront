// app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  isLoggedIn$ = this.authService.isLoggedIn$;
  loggedInUsername: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.checkAuthStatus();
    this.loggedInUsername = this.authService.getUsername() || 'Guest';
  }

  logout() {
    this.authService.logout();
  }
}
