import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    const isLoggedIn = this.checkAuthStatus();
    this.isLoggedInSubject.next(isLoggedIn); // Initialize the login state
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  public checkAuthStatus(): boolean {
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

  public getUsername(): string | null {
    return localStorage.getItem('username');
  }

  public decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1]; // Extract payload from JWT
      const decoded = JSON.parse(atob(payload)); // Decode base64
      return decoded;
    } catch (error) {
      console.error('Invalid token:', error);
      return {}; // Return empty object in case of decoding failure
    }
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Token is missing or invalid');
      }
      
      let decodedToken;
      try {
        decodedToken = this.decodeToken(token); // Decode the token
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        throw new Error('Failed to decode token');
      }
      
      const username = decodedToken.sub || 'Unknown';
      const userId = decodedToken.userId || 'Unknown';
      
      if (username === 'Unknown' || userId === 'Unknown') {
        console.warn('Token missing required fields: username or userId');
      }
      
      return { username, id: userId };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return { username: 'Unknown', id: 'Unknown' };
    }
  }
  

  // ใน AuthService

  register(user: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }
  

  public login(user: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        // Assuming response.token exists and contains a JWT
        const token = response.token;
        this.setToken(token);
        
        // Option A: Store username directly from the response (if available)
        if (response.username) {
          localStorage.setItem('username', response.username);
        } else {
          // Option B: Decode the token to extract username
          const decodedToken = this.decodeToken(token);
          const username = decodedToken.sub || 'Unknown';
          localStorage.setItem('username', username);
        }
      })
    );
  }
  

  public setToken(token: string): void {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true); // After setting token, update the login state
  }

  public logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false); // Update the state when logging out
  }
  public getUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken.userId || null;
    }
    return null;
  }
}
