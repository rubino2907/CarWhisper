import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export type ChatMessage = {
  from: 'user' | 'bot';
  message: string;
  time: Date;
};

@Injectable({
  providedIn: 'root'
})
export class MessageService {
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
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async getChatMessages(chatId: number): Promise<ChatMessage[]> {
    const res = await fetch(`${this.baseUrl}/chat/${chatId}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar mensagens');
    const data = await res.json();
    return data.map((m: any) => ({
      from: m.role === 'user' ? 'user' : 'bot',
      message: m.content,
      time: new Date(m.created_at)
    }));
  }

  async sendMessage(payload: { chat_id: number; role: string; content: string }): Promise<ChatMessage> {
    const res = await fetch(`${this.baseUrl}/add`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao enviar mensagem');
    const m = await res.json();
    return {
      from: 'user',
      message: m.content,
      time: new Date(m.created_at)
    };
  }
}
