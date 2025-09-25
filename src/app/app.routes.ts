import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { ChatDashboard } from './pages/chat-dashboard/chat-dashboard';
import { LoginPage } from './pages/login-page/login-page';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'login', component: LoginPage },
  { path: 'chat-dashboard', component: ChatDashboard, canActivate: [AuthGuard]  },
  // fallback para qualquer rota desconhecida
  { path: '**', redirectTo: '' } 
];

