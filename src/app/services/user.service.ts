import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  username: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private base = 'http://localhost:8000/api/users';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Obtém token de forma segura (SSR-safe)
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null; // SSR não tem localStorage
  }

  // Cabeçalhos HTTP com token
  private getHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ''
    };
  }

  // Obter info do utilizador atual
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("Token não encontrado");

    const res = await fetch(`${this.base}/me`, {
      headers: this.getHeaders()
    });

    if (!res.ok) throw new Error("Erro ao obter dados do utilizador");
    return res.json();
  }
}
