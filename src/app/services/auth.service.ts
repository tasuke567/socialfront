import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
  export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth'; // URL ของ API backend
    private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkAuthStatus());
    isLoggedIn$ = this.isLoggedInSubject.asObservable();
  
    constructor(private http: HttpClient) {}
  
    isAuthenticated(): boolean {
      const token = localStorage.getItem('token');
      return !!token;
    }
  
    checkAuthStatus(): boolean {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }
      const decodedToken = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        this.logout();
        return false;
      }
      return true;
    }
  
    decodeToken(token: string): any {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    }
  
    register(user: { name: string, email: string, password: string }): Observable<any> {
      return this.http.post(`${this.apiUrl}/register`, user);
    }
  
    login(user: { email: string, password: string }): Observable<any> {
      return this.http.post(`${this.apiUrl}/login`, user);
    }
  
    setToken(token: string): void {
      localStorage.setItem('token', token);
    }
  
    getToken(): string | null {
      return localStorage.getItem('token');
    }
  
    logout(): void {
      localStorage.removeItem('token');
    }
  
    // ฟังก์ชันดึง userId จาก token
    getUserId(): string | null {
      const token = this.getToken();
      if (token) {
        const decodedToken = this.decodeToken(token);
        return decodedToken.userId || null;  // สมมุติว่า userId เก็บอยู่ใน payload ของ token
      }
      return null;
    }
  }
  