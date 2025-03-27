import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private userProfileSubject = new BehaviorSubject<UserProfile>(null!);
  userProfile$ = this.userProfileSubject.asObservable();

  constructor(private http: HttpClient) {
    // ตรวจสอบสถานะการล็อกอินตอนเริ่มแอป
    const isLoggedIn = this.checkAuthStatus();
    this.isLoggedInSubject.next(isLoggedIn);
  }
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // เช็คว่ามี token อยู่ใน localStorage หรือเปล่า
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // ตรวจสอบความถูกต้องและวันหมดอายุของ token
  public checkAuthStatus(): boolean {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.isLoggedInSubject.next(false);
        return false;
      }
      const decodedToken = this.decodeToken(token);
      const currentTime = Date.now() / 1000;

      // ถ้า token หมดอายุ ก็ต้อง logout เลยจ้า
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

  // ดึง username จาก localStorage (ถ้ามีเก็บไว้ตอนล็อกอิน)
  public getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // Decode token โดยแยก payload ออกจาก JWT (แบบ decode base64)
  public decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1]; // แยก payload
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Invalid token:', error);
      return {}; // คืนค่า object ว่าง ๆ ถ้า decode ไม่ได้
    }
  }

  // ดึง token จาก localStorage
  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ดึงข้อมูลผู้ใช้จาก token ที่ decode แล้ว (เจาะลึกแบบเจน Z)
  public getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Token is missing or invalid');
      }

      let decodedToken;
      try {
        decodedToken = this.decodeToken(token);
        if (!decodedToken || !decodedToken.sub || !decodedToken.userId) {
          throw new Error('Token missing required fields');
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        throw new Error('Failed to decode token');
      }

      const username = decodedToken.sub || 'Unknown';
      const userId = decodedToken.userId || 'Unknown';

      if (username === 'Unknown' || userId === 'Unknown') {
        console.warn('Token missing required fields: username or userId');
      }

      return {
        username,
        id: userId,
        profilePicture: decodedToken.profilePicture || null,
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return { username: 'Unknown', id: 'Unknown' };
    }
  }

  // สมัครสมาชิกแบบง่าย ๆ ไม่ต้องคิดมาก
  register(user: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // ล็อกอินแล้วรับ token กลับมา พร้อมบันทึก username เข้า localStorage
  public login(user: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        // สมมติว่า response.token มี JWT ให้เราเลย
        const token = response.token;
        this.setToken(token);
  
        // บันทึก username ลง localStorage ถ้ามี หรือ decode จาก token กรณีไม่มี
        if (response.username) {
          localStorage.setItem('username', response.username);
        } else {
          const decodedToken = this.decodeToken(token);
          const username = decodedToken.sub || 'Unknown';
          localStorage.setItem('username', username);
        }
  
        // ถ้า API ส่ง field hasInterests มา ให้ update สถานะใน user profile
        if (response.hasInterests !== undefined) {
          this.updateUserInterestsStatus(response.hasInterests);
        }
      })
    );
  }
  

  // เซ็ต token ลงใน localStorage แล้ว update สถานะการล็อกอิน
  public setToken(token: string): void {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);
  }

  // ล้าง token เมื่อออกจากระบบ แล้วอัปเดตสถานะ logout
  public logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
  }

  // ดึง userId จาก token ที่ decode แล้ว
  public getUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken.userId || null;
    }
    return null;
  }

  // ค้นหาผู้ใช้จาก API
  public searchUsers(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?query=${query}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`, {
      headers: this.getAuthHeaders(),
    });
  }

  checkInterests(): Observable<boolean> {
    // Implement your actual API call or interest check logic here
    return this.http.get<boolean>(`${this.apiUrl}/has-interests`);
  }

  updateUserInterestsStatus(hasInterests: boolean): void {
    const user = this.getCurrentUser();
    if (user) {
      // Add hasInterests property while preserving existing user properties
      const updatedUser: UserProfile = {
        ...user, // Spread existing user properties first
        hasInterests: hasInterests,
        isActive: false,
        isEmailVerified: false,
        isPhoneVerified: false,
        isTwoFactorEnabled: false,
        isTwoFactorVerified: false,
        isTwoFactorBackupCodesGenerated: false,
        isTwoFactorBackupCodesUsed: false,
        followingCount: 0,
        followersCount: 0,
        postsCount: 0,
        instagram: '',
        twitter: '',
        facebook: '',
        bio: '',
        email: '',
        firstName: '',
        lastName: '',
        roles: '',
        profilePicture: '',
        interestsCount: 0,
        interests: [],
        

      };
  
      this.userProfileSubject.next(updatedUser);
    }
  }
  
  updateProfile(profile: FormData): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/me`, profile, {
      headers: this.getAuthHeaders()
    });
  }
  
}
