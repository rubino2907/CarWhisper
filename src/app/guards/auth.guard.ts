import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    // If not running in browser, deny by redirecting to login (adjust as needed for SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return of(this.router.parseUrl('/login'));
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return of(this.router.parseUrl('/login'));
    }

    // Validate token with backend (/auth/me) via AuthService.validateToken()
    return this.auth.validateToken().pipe(
      map((valid) => (valid ? true : this.router.parseUrl('/login'))),
      catchError(() => of(this.router.parseUrl('/login')))
    );
  }
}
