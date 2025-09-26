import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { Observable } from 'rxjs';
import { NgZone } from '@angular/core';


interface ChatCard {
  date: string;
  excerpt: string;
  model?: string;
  lastMessage: string;
}

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.html',
  styleUrls: ['./chat-dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog ],
})

export class ChatDashboard {
  // ========================
  // Autenticação / User
  // ========================
  username: string = '';
  userId: string = '';

  async ngOnInit() {
    await this.loadUser();
  }

  // ========================
  // UI / Estado da página
  // ========================

  activeSection: 'chats' | 'predictor' = 'chats';
  showConfirm = false;
  confirmIndex: number | null = null;
  private base = '/api';

  // ========================
  // Função para carregar user
  // ========================

  constructor(private ngZone: NgZone) {}
  
  private async loadUser(): Promise<void> {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/me", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) return;

      const data = await res.json();

      this.ngZone.run(() => {
        this.username = data.username; // ⚡ dentro do zone
      });
    } catch (err) {
      console.error(err);
    }
  }

  // ========================
  // Chats
  // ========================

  chats: ChatCard[] = [];
  selectedChat: ChatCard | null = null;
  chatMessages: { from: 'user' | 'bot'; message: string; time: Date }[] = [];

/* loadUserChats() {
    if (!this.userId) return;

    fetch(`/api/chats?userId=${this.userId}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
      .then(res => res.json())
      .then((data: ChatCard[]) => this.chats = data)
      .catch(err => console.error('Erro ao carregar chats:', err));
  }
*/

/* createNewChat(title: string = 'Nova conversa') {
    fetch('/api/chats/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
      body: JSON.stringify({ title })
    })
      .then(res => res.json())
      .then((newChat: ChatCard) => {
        this.chats = [newChat, ...this.chats];
        this.openChat(newChat);
      })
      .catch(err => console.error('Erro ao criar chat:', err));
  }
*/

  openChat(chat: ChatCard) {
    this.selectedChat = chat;
    this.showPredictor = false;
    this.chatMessages = [{
      from: 'bot',
      message: 'Olá! Eu sou o CarWhisper, fala-me do teu carro 🚗',
      time: new Date()
    }];
  }

  closeChat() { this.selectedChat = null; }

  sendMessage(inputValue: string) {
    if (!inputValue) return;
    this.chatMessages.push({ from: 'user', message: inputValue, time: new Date() });
  }

  askDelete(index: number) {
    this.showConfirm = true;
    this.confirmIndex = index;
  }

  deleteChat(index: number | null) {
    if (index !== null) {
      if (this.selectedChat === this.chats[index]) this.closeChat();
      this.chats.splice(index, 1);
    }
    this.showConfirm = false;
    this.confirmIndex = null;
  }

  openChats() {
    this.activeSection = 'chats';
    this.selectedChat = null;
  }

  // ========================
  // Value Predictor
  // ========================

  showPredictor = false;
  predictorStep = 0;
  predictorSteps = ['Basic', 'Usage', 'Fuel & Country', 'Review'];

  predictorData = this.getEmptyPredictorData();

  openValuePredictor() {
    this.activeSection = 'predictor';
    this.selectedChat = null;
    this.predictorStep = 0;
    this.predictorData = this.getEmptyPredictorData();
  }

  getEmptyPredictorData() {
    return {
      manufacturer: '',
      model: '',
      year: new Date().getFullYear(),
      odometer: 0,
      transmission: 'automatic',
      fuel: 'gas',
      country: 'US'
    };
  }

  nextStep() { if (this.predictorStep < this.predictorSteps.length - 1) this.predictorStep++; }
  prevStep() { if (this.predictorStep > 0) this.predictorStep--; }

  submitPredictor() {
    const request = { features: { ...this.predictorData } };
    this.chatMessages.push({ from: 'user', message: `Enviei as features do carro 🚙:\n${JSON.stringify(request.features, null, 2)}`, time: new Date() });
    this.chatMessages.push({ from: 'bot', message: 'Recebi as informações, a processar...', time: new Date() });

    fetch('api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
      .then(res => res.json())
      .then(data => {
        const price = data.price ?? 'N/A';
        this.chatMessages.push({ from: 'bot', message: `O preço estimado do carro é: $${price}`, time: new Date() });
        this.showPredictor = false;
      })
      .catch(err => this.chatMessages.push({ from: 'bot', message: `Erro ao enviar para a API: ${err}`, time: new Date() }));
  }

  // ========================
  // Dados fixos
  // ========================

  manufacturers: string[] = [
    "mercedes-benz","bmw","hyundai","ford","vauxhall","volkswagen","audi","skoda",
    "toyota","gmc","chevrolet","jeep","nissan","ram","mazda","cadillac",
    "honda","dodge","lexus","jaguar","buick","chrysler","volvo","infiniti",
    "lincoln","alfa-romeo","subaru","acura","mitsubishi","porsche","kia",
    "ferrari","mini","pontiac","fiat","rover","tesla","saturn","mercury",
    "harley-davidson","datsun","aston-martin","land rover","suzuki","citroen",
    "seat","lancia","smart","hummer","bentley","maserati","isuzu","lamborghini",
    "lotus","renault","peugeot","rolls-royce","dacia"
  ];
  countries: string[] = ["US", "UK", "DE"];
}