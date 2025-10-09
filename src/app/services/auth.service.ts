import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, of, catchError, map } from 'rxjs';
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
    localStorage.removeItem('token');
    localStorage.removeItem('carwhisper_refresh');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Validate token with backend
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    console.log('🔍 validateToken - Using getCurrentUser() with interceptor');
    return this.getCurrentUser().pipe(
      map(() => {
        console.log('🔑 Token validation successful');
        return true;
      }),
      catchError((err) => {
        console.log('🔑 Token validation failed:', err);
        this.logout(); // Clear invalid token
        return of(false);
      })
    );
  }

  // Test endpoint to trigger token renewal check
  getCurrentUser(): Observable<any> {
    console.log('🔍 AuthService - Making request to /auth/me');
    console.log('🔍 AuthService - authInterceptor will automatically add Authorization header');
    return this.http.get(`${this.baseUrl}/auth/me`);
  }

  // Alternative manual approach (for comparison)
  getCurrentUserManual(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.baseUrl}/auth/me`, { headers });
  }

  // Initialize authentication on app startup
  initializeAuth(): Observable<boolean> {
    console.log('🔐 Initializing authentication...');
    return this.validateToken();
  }

  // Debug method to test interceptor
  testInterceptor(): void {
    console.log('🧪 Testing interceptor...');
    console.log('🧪 Current token in localStorage:', localStorage.getItem('token'));

    this.getCurrentUser().subscribe({
      next: (user) => {
        console.log('🧪 Interceptor test successful:', user);
      },
      error: (err) => {
        console.log('🧪 Interceptor test failed:', err);
      },
    });
  }

  private saveTokens(res: AuthResponse | null): void {
    if (!res) return;
    if (res.access_token) {
      localStorage.setItem('token', res.access_token);
      console.log('🔐 Token saved to localStorage');
    }
  }
}
