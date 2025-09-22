import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatCard {
  date: string;
  excerpt: string;
  model?: string;
  replies: number;
  lastMessage: string;
}

const sampleMessages = [
  "Preciso de ajuda para escolher um carro elétrico 🚗⚡",
  "Qual a diferença entre híbrido e plug-in?",
  "Mostra-me os modelos mais económicos de 2023.",
  "O que achas do Tesla Model 3?",
  "Vale a pena comprar um carro usado com 200k km?",
  "Qual a manutenção típica de um carro diesel?",
  "Recomendações de SUVs familiares?",
  "Quais são os carros mais populares na Alemanha?"
];

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.html',
  styleUrls: ['./chat-dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChatDashboard {
  username = 'Ruben';

  chats: ChatCard[] = Array.from({ length: 8 }).map((_, i) => ({
    date: ['Jan 24, 2024','Jan 16, 2024','Jan 12, 2024','Jan 10, 2024','Dec 26, 2023','Dec 12, 2023','Dec 1, 2023','Nov 15, 2023'][i % 8],
    excerpt: 'Lorem ipsum dolor sit amet consectetur...',
    model: 'CarWhisper',
    replies: Math.floor(Math.random() * 50),
    lastMessage: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
  }));

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

  selectedChat: ChatCard | null = null;
  chatMessages: {from: 'user' | 'bot', message: string}[] = [];

  activeSection: 'chats' | 'predictor' = 'chats';

  // Ao clicar no botão Chats
  openChats() {
    this.activeSection = 'chats';
    this.selectedChat = null; // opcional, fecha o chat atual
  }

  // Value Predictor
  showPredictor = false;
  predictorStep = 0;
  predictorSteps = ['Basic', 'Usage', 'Fuel & Country', 'Review'];
  predictorData = {
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    odometer: 0,
    transmission: 'automatic',
    fuel: 'gas',
    country: 'US'
  };

  // Abrir chat normal
  openChat(chat: ChatCard) {
    this.selectedChat = chat;
    this.showPredictor = false;
    this.chatMessages = [
      { from: 'bot', message: 'Olá! Eu sou o CarWhisper, fala-me do teu carro 🚗' }
    ];
  }

  closeChat() {
    this.selectedChat = null;
  }

  deleteChat(index: number) {
    if (this.selectedChat === this.chats[index]) this.closeChat();
    this.chats.splice(index, 1);
  }

  createNewChat() {
    const newChat: ChatCard = {
      date: new Date().toLocaleDateString(),
      excerpt: 'Nova conversa iniciada...',
      model: 'CarWhisper',
      replies: 0,
      lastMessage: ''
    };
    this.chats = [newChat, ...this.chats];
    this.openChat(newChat);
  }

  sendMessage(inputValue: string) {
    if (!inputValue) return;
    this.chatMessages.push({ from: 'user', message: inputValue });
  }

  // Ao clicar no botão Value Predictor
  openValuePredictor() {
    this.activeSection = 'predictor';
    this.selectedChat = null;
    this.predictorStep = 0;
    this.predictorData = {
      manufacturer: '',
      model: '',
      year: new Date().getFullYear(),
      odometer: 0,
      transmission: 'automatic',
      fuel: 'gas',
      country: 'US'
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
      message: `Enviei as features do carro 🚙:\n${JSON.stringify(request.features, null, 2)}`
    });

    this.chatMessages.push({
      from: 'bot',
      message: 'Recebi as informações, a processar...'
    });

    fetch('api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
      .then(res => res.json())
      .then(data => {
        this.chatMessages.push({
          from: 'bot',
          message: `Resposta da API: ${JSON.stringify(data, null, 2)}`
        });
        this.showPredictor = false;
      })
      .catch(err => {
        this.chatMessages.push({
          from: 'bot',
          message: `Erro ao enviar para a API: ${err}`
        });
        console.error(err);
      });
  }
}
