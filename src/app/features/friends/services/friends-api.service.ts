import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse ,HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FriendsApiService {
  private apiUrl = 'http://localhost:3000/api/friends/';

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
  searchUsers(query: string, page: number = 1, limit: number = 10): Observable<User[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<User[]>(`${this.apiUrl}/search`, { params });
  }

  // ส่งคำขอแอดเพื่อน
  sendFriendRequest(friendId: string): Observable<any> {
    return this.http.post<any>(`/api/friends/request`, { friendId });
  }
}
