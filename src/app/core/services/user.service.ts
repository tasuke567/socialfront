import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/friend';

  constructor(private http: HttpClient) {}

  // เพิ่มเพื่อน
  addFriend(userId: string, friendId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${userId}/add-friend/${friendId}`,
      {}
    );
  }

  // ดึงรายชื่อเพื่อน
  getFriends(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }
}
