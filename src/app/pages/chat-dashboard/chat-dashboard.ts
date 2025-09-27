import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { NewChatDialog } from '../../shared/new-chat-dialog/new-chat-dialog';
import { NgZone } from '@angular/core';


interface ChatCard {
  id: number;
  title: string;
  created_at: string;
  user_id: number;
  model?: string;       // opcional, se depois quiseres usar
  lastMessage?: string; // opcional
}


@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.html',
  styleUrls: ['./chat-dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog, NewChatDialog ],
})

export class ChatDashboard {
  // ========================
  // Autenticação / User
  // ========================
  username: string = '';
  userId: string = '';

  async ngOnInit() {
    await this.loadUser();
    await this.loadUserChats();
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
  showNewChatPopup = false;
  chatMessages: { from: 'user' | 'bot'; message: string; time: Date }[] = [];

  private async loadUserChats(): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/chats/userchats", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) return;

    const data = await res.json();
    this.ngZone.run(() => {
      this.chats = data.Chats.map((chat: any) => ({
        ...chat,
        model: chat.model || 'CarModel',
        lastMessage: chat.lastMessage || 'Sem mensagens ainda'
      }));
    });
  } catch (err) {
    console.error(err);
  }
  }

async createNewChat(title: string) {
  const token = localStorage.getItem("token");
  if (!token || !title.trim()) return;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/chats/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });

    if (!res.ok) throw new Error('Erro ao criar chat');

    const newChat: ChatCard = await res.json();

    if (!newChat.model) newChat.model = "CarModel";

    // 1️⃣ Abre o chat imediatamente
    this.ngZone.run(() => {
      this.openChat(newChat);
      this.chats = [newChat, ...this.chats]; // adiciona provisoriamente no topo
    });

    // 2️⃣ Atualiza a lista completa em background
    this.loadUserChats(); // não await, só para atualizar o array depois

  } catch (err) {
    console.error('Erro ao criar chat:', err);
  }
}

  openChat(chat: ChatCard) {
    this.selectedChat = chat;
    this.showPredictor = false;

    // Mensagem inicial fixa do bot
    const botMessage: { from: 'user' | 'bot'; message: string; time: Date } = {
      from: 'bot', 
      message: 'Olá! Eu sou o CarWhisper, fala-me do teu carro 🚗',
      time: new Date()
    };

    // Mantém mensagens anteriores ou inicia com a do bot
    this.chatMessages = [botMessage];

    // Carrega mensagens do backend
    this.loadChatMessages(chat.id);
  }


  closeChat() { this.selectedChat = null; }

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

  openNewChatPopup() {
  this.showNewChatPopup = true;
  }

  onChatCreated(title: string) {
    this.createNewChat(title);
    this.showNewChatPopup = false;
  }

  cancelNewChat() {
    this.showNewChatPopup = false;
  }

  // ========================
  // Messages
  // ========================
  async loadChatMessages(chatId: number) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/messages/chat/${chatId}`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      }
    });
    if (!res.ok) throw new Error('Erro ao carregar mensagens');

    const data = await res.json();

    this.ngZone.run(() => {
      // Garante a mensagem inicial do bot
      const botMessage = {
        from: 'bot',
        message: 'Olá! Eu sou o CarWhisper, fala-me do teu carro 🚗',
        time: new Date()
      };

      // Preenche chatMessages: botMessage + mensagens do backend
      this.chatMessages = [
        botMessage,
        ...(data.map((m: any) => ({
          from: m.role === 'user' ? 'user' : 'bot',
          message: m.content,
          time: new Date(m.created_at)
        })) || [])
      ];
    });

  } catch (err) {
    console.error('Erro ao carregar mensagens:', err);
  }
}

  
  async sendMessage(inputValue: string) {
    if (!inputValue || !this.selectedChat) return; // evita vazio ou chat não selecionado

    const token = localStorage.getItem("token");
    if (!token) return;

    const messagePayload = {
      chat_id: this.selectedChat.id,
      role: "user",
      content: inputValue
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/messages/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(messagePayload)
      });

      if (!res.ok) throw new Error("Erro ao enviar mensagem");

      const newMessage = await res.json(); // recebe a mensagem criada

      this.ngZone.run(() => {
        // adiciona a mensagem enviada localmente
        this.chatMessages.push({
          from: "user",
          message: newMessage.content,
          time: new Date(newMessage.created_at)
        });
      });

    } catch (err) {
      console.error(err);
      this.ngZone.run(() => {
        // opcional: mostra erro no chat
        this.chatMessages.push({
          from: "bot",
          message: "Não foi possível enviar a mensagem 😅",
          time: new Date()
        });
      });
    }
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