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
  template: `
    <nav class="navbar">
      <a routerLink="/">Home</a>
      <ng-container *ngIf="isLoggedIn$ | async; else authLinks">
        <a routerLink="/friends">Friends</a>
        <button (click)="logout()">Logout</button>
      </ng-container>
      <ng-template #authLinks>
        <a routerLink="/login">Login</a>
        <a routerLink="/register">Register</a>
      </ng-template>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  isLoggedIn$ = this.authService.isLoggedIn$;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.checkAuthStatus();
  }

  logout() {
    this.authService.logout();
  }
}