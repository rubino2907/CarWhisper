import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type ChatMessage = {
  from: 'user' | 'bot';
  message: string;
  time: Date;
};

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getChatMessages(chatId: number): Observable<ChatMessage[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/messages/chat/${chatId}`).pipe(
      map((data) =>
        data.map(
          (m: any) =>
            ({
              from: m.role === 'user' ? 'user' : 'bot',
              message: m.content,
              time: new Date(m.created_at),
            } as ChatMessage)
        )
      )
    );
  }

  sendMessage(payload: {
    chat_id: number;
    role: string;
    content: string;
  }): Observable<ChatMessage> {
    return this.http.post<any>(`${this.baseUrl}/api/messages/add`, payload).pipe(
      map(
        (m) =>
          ({
            from: 'user',
            message: m.content,
            time: new Date(m.created_at),
          } as ChatMessage)
      )
    );
  }
}
