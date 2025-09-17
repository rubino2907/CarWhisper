import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { ChatDashboard } from './pages/chat-dashboard/chat-dashboard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'chat-dashboard', component: ChatDashboard },
  { path: '**', redirectTo: '' }
];
