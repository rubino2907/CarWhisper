import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserChats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/chats/userchats`);
  }

  createChat(title: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/chats/create`, { title });
  }

  deleteChat(chatId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/chats/delete/${chatId}`);
  }
}
