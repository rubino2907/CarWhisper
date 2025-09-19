import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  // Ajusta esta URL para o endpoint do teu backend / Stych
  private base = '/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password })
      .pipe(tap(res => this.saveTokens(res)));
  }

  register(email: string, password: string, name?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, { email, password, name })
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
