// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login/login.component';
import { RegisterComponent } from './components/register/register/register.component';
import { FriendsComponent } from './features/friends/components/friends-list/friends.component';
import { HomeComponent } from './features/home/components/home/home.component';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent  
  },
  { 
    path: 'friends', 
    component: FriendsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicOnlyGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [publicOnlyGuard]
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];