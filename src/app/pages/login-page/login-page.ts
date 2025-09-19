import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css']
})
export class LoginPage {
  isLogin = true;
  loading = false;
  error: string | null = null;

  // Login
  loginEmail = '';
  loginPassword = '';

  // Registo
  registerName = '';
  registerEmail = '';
  registerPassword = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    console.log('LoginPage carregada!');
  }

  toggleAuth() {
    this.isLogin = !this.isLogin;
    console.log('Alternou auth, isLogin =', this.isLogin);
    this.error = null;
    this.clearFields();
  }

  private clearFields() {
    this.loginEmail = '';
    this.loginPassword = '';
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
    console.log('Campos limpos');
  }

  login() {
    if (!this.loginEmail || !this.loginPassword) {
      this.error = 'Por favor, preencha todos os campos.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res: any) => {
        this.loading = false;
        localStorage.setItem('token', res.token);  // Guarda o token
        console.log('Login bem-sucedido, token armazenado:', res.token);
        this.router.navigate(['/chat-dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Não foi possível conectar ao servidor. Por favor, espera pelo backend.';
        console.log('Erro no login (debug):', err);
      }
    });
  }

  register() {
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.error = 'Por favor, preencha todos os campos.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.auth.register(this.registerEmail, this.registerPassword, this.registerName)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          localStorage.setItem('token', res.token);  // Guarda o token
          console.log('Registo bem-sucedido, token armazenado:', res.token);
          this.router.navigate(['/chat-dashboard']);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Não foi possível conectar ao servidor. Por favor, espera pelo backend.';
          console.log('Erro no registo (debug):', err);
        }
      });
  }
}
