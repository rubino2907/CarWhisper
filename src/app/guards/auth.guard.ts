import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(): boolean {
    let token: string | null = null;

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token');
    }

    if (token && this.isTokenValid(token)) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  // Verifica se o token JWT está válido (não expirado)
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp é em segundos
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp > now;
    } catch (e) {
      return false;
    }
  }
}
