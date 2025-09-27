import { CommonModule } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { NewChatDialog } from '../../shared/new-chat-dialog/new-chat-dialog';
import { ChatService } from '../../services/chat.service';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';

interface ChatCard {
  id: number;
  title: string;
  created_at: string;
  user_id: number;
  model?: string;
  lastMessage?: string;
}

type ChatMessage = {
  from: 'user' | 'bot';
  message: string;
  time: Date;
};

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.html',
  styleUrls: ['./chat-dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog, NewChatDialog],
})
export class ChatDashboard {
  username = '';
  userId = '';

  activeSection: 'chats' | 'predictor' = 'chats';
  showConfirm = false;
  confirmIndex: number | null = null;

  chats: ChatCard[] = [];
  selectedChat: ChatCard | null = null;
  showNewChatPopup = false;
  chatMessages: ChatMessage[] = [];

  showPredictor = false;
  predictorStep = 0;
  predictorSteps = ['Basic', 'Usage', 'Fuel & Country', 'Review'];
  predictorData = this.getEmptyPredictorData();

  manufacturers: string[] = [
    'mercedes-benz','bmw','hyundai','ford','vauxhall','volkswagen','audi','skoda',
    'toyota','gmc','chevrolet','jeep','nissan','ram','mazda','cadillac','honda',
    'dodge','lexus','jaguar','buick','chrysler','volvo','infiniti','lincoln','alfa-romeo',
    'subaru','acura','mitsubishi','porsche','kia','ferrari','mini','pontiac','fiat','rover',
    'tesla','saturn','mercury','harley-davidson','datsun','aston-martin','land rover',
    'suzuki','citroen','seat','lancia','smart','hummer','bentley','maserati','isuzu',
    'lamborghini','lotus','renault','peugeot','rolls-royce','dacia'
  ];
  countries: string[] = ['US', 'UK', 'DE'];

  constructor(
    private ngZone: NgZone,
    private chatService: ChatService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    await this.loadUser();
    await this.loadUserChats();
  }

  private async loadUser() {
    try {
      const user = await this.userService.getCurrentUser();
      this.ngZone.run(() => (this.username = user.username));
    } catch (err) {
      console.error('Erro ao carregar user:', err);
    }
  }

  logout() {
    localStorage.removeItem('token'); // ou sessionStorage, conforme usas
    this.username = '';
    this.selectedChat = null;
    this.chats = [];
    this.chatMessages = [];
    // redireciona para login
    window.location.href = '/login';
  }

  // ========================
  // Chats
  // ========================

  async loadUserChats() {
    try {
      const data = await this.chatService.getUserChats();
      this.ngZone.run(() => {
        this.chats = data.Chats.map((chat: any) => ({
          ...chat,
          model: chat.model || 'CarModel',
          lastMessage: chat.lastMessage || 'Sem mensagens ainda',
        }));
      });
    } catch (err) {
      console.error('Erro ao carregar chats:', err);
    }
  }

  async createNewChat(title: string) {
    if (!title.trim()) return;

    try {
      const newChat: ChatCard = await this.chatService.createChat(title);
      if (!newChat.model) newChat.model = 'CarModel';

      this.ngZone.run(() => {
        this.openChat(newChat);
        this.chats = [newChat, ...this.chats];
      });

      await this.loadUserChats(); // atualiza lista completa
    } catch (err) {
      console.error('Erro ao criar chat:', err);
    }
  }

  async deleteChatByIndex(index: number | null) {
    if (index === null) return;
    const chat = this.chats[index];

    try {
      await this.chatService.deleteChat(chat.id);
      this.ngZone.run(() => {
        if (this.selectedChat === chat) this.closeChat();
        this.chats.splice(index, 1);
        this.showConfirm = false;
        this.confirmIndex = null;
      });
    } catch (err) {
      console.error('Erro ao apagar chat:', err);
    }
  }

  openChat(chat: ChatCard) {
    this.selectedChat = chat;
    this.showPredictor = false;

    const botMessage: ChatMessage = {
      from: 'bot',
      message: 'Olá! Eu sou o CarWhisper, fala-me do teu carro 🚗',
      time: new Date(),
    };

    this.chatMessages = [botMessage];
    this.loadChatMessages(chat.id);
  }

  closeChat() {
    this.selectedChat = null;
  }

  askDelete(index: number) {
    this.showConfirm = true;
    this.confirmIndex = index;
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
    try {
      const messages = await this.messageService.getChatMessages(chatId);
      const botMessage: ChatMessage = {
        from: 'bot',
        message: 'Olá! Eu sou o CarWhisper, fala-me do teu carro 🚗',
        time: new Date(),
      };
      this.ngZone.run(() => {
        this.chatMessages = [botMessage, ...messages];
      });
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  }

  async sendMessage(inputValue: string) {
    if (!inputValue || !this.selectedChat) return;

    try {
      const newMessage = await this.messageService.sendMessage({
        chat_id: this.selectedChat.id,
        role: 'user',
        content: inputValue,
      });

      this.ngZone.run(() => {
        this.chatMessages.push(newMessage);
      });
    } catch (err) {
      console.error(err);
      this.ngZone.run(() => {
        this.chatMessages.push({
          from: 'bot',
          message: 'Não foi possível enviar a mensagem 😅',
          time: new Date(),
        });
      });
    }
  }

  // ========================
  // Value Predictor
  // ========================

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
      country: 'US',
    };
  }

  nextStep() {
    if (this.predictorStep < this.predictorSteps.length - 1) this.predictorStep++;
  }

  prevStep() {
    if (this.predictorStep > 0) this.predictorStep--;
  }

  submitPredictor() {
    const request = { features: { ...this.predictorData } };
    this.chatMessages.push({
      from: 'user',
      message: `Enviei as features do carro 🚙:\n${JSON.stringify(
        request.features,
        null,
        2
      )}`,
      time: new Date(),
    });
    this.chatMessages.push({
      from: 'bot',
      message: 'Recebi as informações, a processar...',
      time: new Date(),
    });

    fetch('api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
      .then((res) => res.json())
      .then((data) => {
        const price = data.price ?? 'N/A';
        this.chatMessages.push({
          from: 'bot',
          message: `O preço estimado do carro é: $${price}`,
          time: new Date(),
        });
        this.showPredictor = false;
      })
      .catch((err) =>
        this.chatMessages.push({
          from: 'bot',
          message: `Erro ao enviar para a API: ${err}`,
          time: new Date(),
        })
      );
  }
}
