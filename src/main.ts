import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/services/auth.interceptor';
import { tokenRenewInterceptor } from './app/services/token-renew.interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),   // as tuas rotas
    provideHttpClient( withInterceptors([authInterceptor, tokenRenewInterceptor]) )      
  ]
}).catch(err => console.error(err));
