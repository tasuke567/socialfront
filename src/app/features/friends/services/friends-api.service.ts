import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FriendsApiService {
  private apiUrl = 'http://localhost:3000/api/friends';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error.error?.message || 'Something went wrong!');
  }

  getFriends(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  addFriend(userId: string, friendId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/add-friend/${friendId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  unfriend(userId: string, friendId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/unfriend/${friendId}`).pipe(
      catchError(this.handleError)
    );
  }
}
