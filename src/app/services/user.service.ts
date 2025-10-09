import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<User>(`${this.baseUrl}/api/users/me`, { headers });
  }
}
