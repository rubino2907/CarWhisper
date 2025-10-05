import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);   // 👈 injeta diretamente
  private base = 'http://localhost:8000/auth';

  login(username: string, password: string): Observable<AuthResponse> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<AuthResponse>(`${this.base}/signin`, body.toString(), { headers })
      .pipe(tap(res => this.saveTokens(res)));
  }

  register(email: string, password: string, username?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/signup`, { email, password, username })
      .pipe(tap(res => this.saveTokens(res)));
  }

  logout(): void {
    localStorage.removeItem('carwhisper_token');
    localStorage.removeItem('carwhisper_refresh');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('carwhisper_token');
  }

  private saveTokens(res: AuthResponse | null): void {
    if (!res) return;
    if (res.token) localStorage.setItem('carwhisper_token', res.token);
    if (res.refreshToken) localStorage.setItem('carwhisper_refresh', res.refreshToken);
  }
}
