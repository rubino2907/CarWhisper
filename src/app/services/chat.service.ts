import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = environment.apiUrl;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ''
    };
  }

  async getUserChats() {
    const res = await fetch(`${this.baseUrl}/api/user/userchats`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error("Erro ao buscar chats");
    return res.json();
  }

  async createChat(title: string) {
    const res = await fetch(`${this.baseUrl}/api/chats/create`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error("Erro ao criar chat");
    return res.json();
  }

  async deleteChat(chatId: number) {
    const res = await fetch(`${this.baseUrl}/${chatId}`, {
      method: "DELETE",
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error("Erro ao apagar chat");
    return res.json();
  }
}
