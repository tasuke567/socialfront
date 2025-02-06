// src/app/features/friends/services/friends-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FriendsApiService {
  private apiUrl = 'http://localhost:8080/api/friends'; // Change to your API URL

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error.error?.message || 'Something went wrong!');
  }

  // Get friends of a user
  getFriends(userId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${userId}`).pipe(catchError(this.handleError));
  }

  // Add a friend
  addFriend(userId: string, friendId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/add-friend/${friendId}`, {}).pipe(catchError(this.handleError));
  }

  // Remove a friend
  removeFriend(userId: string, friendId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/remove-friend/${friendId}`).pipe(catchError(this.handleError));
  }

  // Check if two users are friends
  checkFriendship(userId: string, friendId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${friendId}`).pipe(catchError(this.handleError));
  }

  // Send a friend request
  sendFriendRequest(userId: string, friendId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/request`, { friendId }).pipe(catchError(this.handleError));
  }

  // Search users (add search endpoint to backend if needed)
  searchUsers(query: string): Observable<User[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<User[]>(`${this.apiUrl}/search`, { params }).pipe(catchError(this.handleError));
  }
}
