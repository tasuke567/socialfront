import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    const isLoggedIn = this.checkAuthStatus();
    this.isLoggedInSubject.next(isLoggedIn); // Initialize the login state
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  checkAuthStatus(): boolean {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        this.isLoggedInSubject.next(false);
        return false;
      }

      const decodedToken = this.decodeToken(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        this.logout();
        this.isLoggedInSubject.next(false);
        return false;
      }

      this.isLoggedInSubject.next(true);
      return true;
    } catch (error) {
      console.error('Error decoding token:', error);
      this.isLoggedInSubject.next(false);
      return false;
    }
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken.username || null; // Assuming 'username' is in the token
    }
    return null;
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1]; // เอาส่วน payload ของ JWT
      const decoded = JSON.parse(atob(payload)); // ถอดรหัส Base64
      console.log('Decoded Token:', decoded); // แสดงผลข้อมูลที่ถอดรหัส
      return decoded;
    } catch (error) {
      console.error('Invalid token:', error);
      return {};
    }
  }

  register(user: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(user: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user);
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true); // After setting token, update the login state
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false); // Update the state when logging out
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken.userId || null;
    }
    return null;
  }

  getCurrentUser() {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('Token is missing or invalid');
      }
  
      let decodedToken;
      try {
        decodedToken = this.decodeToken(token); // ถอดรหัส token
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        throw new Error('Failed to decode token');
      }
  
      // ตรวจสอบว่า username และ userId อยู่ใน decodedToken หรือไม่
      const username = decodedToken.username || 'Unknown';
      const userId = decodedToken.userId || 'Unknown';
  
      // หากไม่มี username หรือ userId ให้บันทึกคำเตือน
      if (username === 'Unknown' || userId === 'Unknown') {
        console.warn('Token missing required fields: username or userId');
      }
  
      return { username, id: userId };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return { username: 'Unknown', id: 'Unknown' }; // หากเกิดข้อผิดพลาด
    }
  }
  
}
