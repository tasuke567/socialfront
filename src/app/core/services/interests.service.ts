import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, from, mergeMap, of } from 'rxjs';
import { catchError, map, toArray } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InterestsService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // ดึงความสนใจของผู้ใช้
  getUserInterests(): Observable<string[]> {
    const userId = this.authService.getCurrentUser().id;
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/interests/list`, {
      headers: this.getAuthHeaders(),
    });
  }

  // เพิ่มความสนใจของผู้ใช้
  addUserInterests(
    interests: string[]
  ): Observable<Array<{ success: boolean; message?: string }>> {
    const userId = this.authService.getCurrentUser().id;

    // Return empty array observable if no interests
    if (!interests || interests.length === 0) {
      return of([]);
    }

    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/${userId}/interests/list`,
        { interests },
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((response) => [
          {
            success: true,
            message: response.message,
          },
        ]),
        catchError((error) => {
          if (error.status === 400) {
            return of([
              {
                success: false,
                message: 'Invalid empty interest list',
              },
            ]);
          }
          if (error.status === 403) {
            return of([
              {
                success: false,
                message: 'Not authorized to modify interests',
              },
            ]);
          }
          return of([
            {
              success: false,
              message: 'Failed to add interests',
            },
          ]);
        })
      );
  }

  checkExistingInterest(interest: string): Observable<boolean> {
    const userId = this.authService.getCurrentUser().id;
    return this.http
      .get<{ exists: boolean }>(
        `${this.apiUrl}/${userId}/interests/check?interest=${encodeURIComponent(
          interest
        )}`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((response) => response.exists),
        catchError(() => of(false))
      );
  }
}
