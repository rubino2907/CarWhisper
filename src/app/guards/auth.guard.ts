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

    // só tenta acessar localStorage se estivermos no browser
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token');
    }

    if (token) {
      return true; // permite acesso à rota
    } else {
      this.router.navigate(['/login']); // redireciona para login
      return false;
    }
  }
}
