import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    // หน้า Home - โหลดเฉพาะเมื่อจำเป็น
    path: '',
    loadComponent: () =>
      import('./features/home/components/home/home.component').then(
        (m) => m.HomeComponent
      ),
    data: { title: 'Home' },
  },
  {
    // หน้าเพื่อน - เข้าถึงได้เฉพาะผู้ที่ล็อกอินแล้ว
    path: 'friends',
    loadComponent: () =>
      import('./features/friends/components/friends-list/friends.component').then(
        (m) => m.FriendsComponent
      ),
    canActivate: [authGuard],
    data: { title: 'Friends' },
  },
  {
    // หน้า Messages - เข้าถึงได้เฉพาะผู้ที่ล็อกอินแล้ว
    path: 'messages',
    loadComponent: () =>
      import('./features/messages/components/messages-list/messages.component').then(
        
        (m) => m.MessagesComponent
      ),
    canActivate: [authGuard],
    data: { title: 'Messages' 

    } ,
  },
  {
    path: 'messages/:conversationId',
    loadComponent: () =>
      import('./features/messages/components/message-detail/messages-detail.component').then(
        (m) => m.MessagesDetailComponent
      ),
    canActivate: [authGuard],
    data: { title: 'Chat' },
  },
  
  {
    // หน้า Notifications - เข้าถึงได้เฉพาะผู้ที่ล็อกอินแล้ว
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/components/notifications-list/notifications.component').then(
        (m) => m.NotificationsComponent
      ),
    canActivate: [authGuard],
    data: { title: 'Notifications' },
  },
  {
    // หน้า Profile - เข้าถึงได้เฉพาะผู้ที่ล็อกอินแล้ว
    path: 'profile/:username',
    loadComponent: () =>
      import('./features/profile/components/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
    data: { title: 'Profile' },
  },
  {
    // หน้า Login - สำหรับผู้ที่ยังไม่ล็อกอิน
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [publicOnlyGuard],
    data: { title: 'Login' },
  },
  {
    // หน้า Register - สำหรับผู้ที่ยังไม่ล็อกอิน
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [publicOnlyGuard],
    data: { title: 'Register' },
  },
  {
    // หน้า Edit Profile - เข้าถึงได้เฉพาะผู้ที่ล็อกอินแล้ว
    path: 'profile/:username/edit',
    loadComponent: () =>
      import('./features/profile/components/profile-edit/profile-edit.component').then(
        (m) => m.ProfileEditComponent
      ),
    canActivate: [authGuard]
  },
  {
    // เส้นทาง fallback: ถ้า URL ไม่ถูกต้อง เปลี่ยนเส้นทางกลับไปที่ Home
    path: '**',
    redirectTo: '',
  },
];
