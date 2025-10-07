import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  access_token: string; // Changed from 'token' to 'access_token' to match backend
  token_type: string;
  user?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient); // 👈 injeta diretamente

  login(username: string, password: string): Observable<AuthResponse> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/signin`, body.toString(), { headers })
      .pipe(tap((res) => this.saveTokens(res)));
  }

  register(email: string, password: string, username?: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/signup`, { email, password, username })
      .pipe(tap((res) => this.saveTokens(res)));
  }

  logout(): void {
    localStorage.removeItem('carwhisper_token');
    localStorage.removeItem('carwhisper_refresh');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('carwhisper_token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Test endpoint to trigger token renewal check
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`);
  }

  private saveTokens(res: AuthResponse | null): void {
    if (!res) return;
    if (res.access_token) localStorage.setItem('token', res.access_token);
  }
}
