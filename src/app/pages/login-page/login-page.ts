import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    console.log('LoginPage carregada!');
  }

  toggleAuth() {
    this.isLogin = !this.isLogin;
    this.error = null;
    this.clearFields();
  }

  private clearFields() {
    this.loginEmail = '';
    this.loginPassword = '';
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
  }

  login() {
    if (!this.loginEmail || !this.loginPassword) {
      this.error = 'Por favor, preencha todos os campos.';
      return;
    }

    this.loading = true;
    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/chat-dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao autenticar';
      }
    });
  }

  register() {
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.error = 'Por favor, preencha todos os campos.';
      return;
    }

    this.loading = true;
    this.auth.register(this.registerEmail, this.registerPassword, this.registerName).subscribe({
      next: () => {
        this.loading = false;
        this.toggleAuth(); // volta para login
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao registar';
      }
    });
  }
}
