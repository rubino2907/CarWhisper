import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { NewChatDialog } from '../../shared/new-chat-dialog/new-chat-dialog';
import { ChatService } from '../../services/chat.service';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

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
  videoId?: string | null;
};

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.html',
  styleUrls: ['./chat-dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog, NewChatDialog],
})
export class ChatDashboard implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

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
    'mercedes-benz',
    'bmw',
    'hyundai',
    'ford',
    'vauxhall',
    'volkswagen',
    'audi',
    'skoda',
    'toyota',
    'gmc',
    'chevrolet',
    'jeep',
    'nissan',
    'ram',
    'mazda',
    'cadillac',
    'honda',
    'dodge',
    'lexus',
    'jaguar',
    'buick',
    'chrysler',
    'volvo',
    'infiniti',
    'lincoln',
    'alfa-romeo',
    'subaru',
    'acura',
    'mitsubishi',
    'porsche',
    'kia',
    'ferrari',
    'mini',
    'pontiac',
    'fiat',
    'rover',
    'tesla',
    'saturn',
    'mercury',
    'harley-davidson',
    'datsun',
    'aston-martin',
    'land rover',
    'suzuki',
    'citroen',
    'seat',
    'lancia',
    'smart',
    'hummer',
    'bentley',
    'maserati',
    'isuzu',
    'lamborghini',
    'lotus',
    'renault',
    'peugeot',
    'rolls-royce',
    'dacia',
  ];
  countries: string[] = ['US', 'UK', 'DE'];

  searchTerm: string = '';

  constructor(
    private ngZone: NgZone,
    private chatService: ChatService,
    private messageService: MessageService,
    private userService: UserService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUser();
    await this.loadUserChats();
  }

  private loadUser() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.ngZone.run(() => (this.username = user.username));
      },
      error: (err) => {
        console.error('Erro ao carregar user:', err);
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.username = '';
    this.selectedChat = null;
    this.chats = [];
    this.chatMessages = [];
    window.location.href = '/login';
  }

  // -------------------------------
  // Chats
  // -------------------------------

  loadUserChats() {
    this.chatService.getUserChats().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.chats = data.Chats.map((chat: any) => ({
            ...chat,
            model: chat.model || 'CarModel',
            lastMessage: chat.lastMessage || 'Sem mensagens ainda',
          }));
        });
      },
      error: (err) => {
        console.error('Erro ao carregar chats:', err);
      },
    });
  }

  createNewChat(title: string) {
    if (!title.trim()) return;

    this.chatService.createChat(title).subscribe({
      next: (newChat: ChatCard) => {
        if (!newChat.model) newChat.model = 'CarModel';

        this.ngZone.run(() => {
          this.openChat(newChat);
          this.chats = [newChat, ...this.chats];
        });

        this.loadUserChats();
      },
      error: (err) => {
        console.error('Erro ao criar chat:', err);
      },
    });
  }

  deleteChatByIndex(index: number | null) {
    if (index === null) return;
    const chat = this.chats[index];

    this.chatService.deleteChat(chat.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          if (this.selectedChat === chat) this.closeChat();
          this.chats.splice(index, 1);
          this.showConfirm = false;
          this.confirmIndex = null;
        });
      },
      error: (err) => {
        console.error('Erro ao apagar chat:', err);
      },
    });
  }

  get filteredChats(): ChatCard[] {
    if (!this.searchTerm.trim()) return this.chats;
    const term = this.searchTerm.toLowerCase();
    return this.chats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(term) ||
        (chat.model && chat.model.toLowerCase().includes(term))
    );
  }

  openChat(chat: ChatCard) {
    this.selectedChat = chat;
    this.showPredictor = false;

    const botMessage: ChatMessage = {
      from: 'bot',
      message: 'Olá! Eu sou o CarWhisperer, fala-me do teu carro 🚗',
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

  // -------------------------------
  // Messages
  // -------------------------------

  loadChatMessages(chatId: number) {
    this.messageService.getChatMessages(chatId).subscribe({
      next: (messages) => {
        this.ngZone.run(() => {
          this.chatMessages = messages.map((msg) => this.processMessage(msg));
          this.scrollToBottom(true); // força scroll
        });
      },
      error: (err) => {
        console.error('Erro ao carregar mensagens:', err);
      },
    });
  }

  sendMessage(inputValue: string) {
    if (!inputValue || !this.selectedChat) return;

    this.messageService
      .sendMessage({
        chat_id: this.selectedChat.id,
        role: 'user',
        content: inputValue,
      })
      .subscribe({
        next: (newMessage) => {
          this.ngZone.run(() => {
            this.chatMessages.push(this.processMessage(newMessage));
            this.scrollToBottom(true);
          });
        },
        error: (err) => {
          console.error(err);
          this.ngZone.run(() => {
            this.chatMessages.push({
              from: 'bot',
              message: 'Não foi possível enviar a mensagem 😅',
              time: new Date(),
            });
            this.scrollToBottom(true);
          });
        },
      });
  }

  private processMessage(msg: any): ChatMessage {
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
    const match = msg.message.match(ytRegex);

    return {
      from: msg.from,
      message: msg.message, // mantém o texto completo, mesmo com link
      time: new Date(msg.time),
      videoId: match ? match[1] : null,
    };
  }

  // -------------------------------
  // Scroll automático
  // -------------------------------

  private scrollToBottom(force: boolean = false): void {
    if (!this.messagesContainer) return;

    const container = this.messagesContainer.nativeElement;
    const threshold = 50;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

    if (atBottom || force) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // -------------------------------
  // Value Predictor
  // -------------------------------

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
      message: `Enviei as features do carro 🚙:\n${JSON.stringify(request.features, null, 2)}`,
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

  // -------------------------------
  // Go too
  // -------------------------------

  // função para ir ao perfil
  goToProfile() {
    // usa ngZone se estiver dentro de chamadas assíncronas
    this.ngZone.run(() => {
      this.router.navigate(['/profile']);
    });
  }
}
