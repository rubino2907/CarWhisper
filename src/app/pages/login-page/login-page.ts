import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,        
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css']  // ← corrigido
})
export class LoginPage {

  ngOnInit() {
  console.log('LoginPage carregada!');
  }

  // Injeta o Router
  constructor(private router: Router) { }

  // Controla se estamos em login ou registo
  isLogin: boolean = true;

  // Variáveis do login
  loginEmail: string = '';
  loginPassword: string = '';

  // Variáveis do registo
  registerName: string = '';
  registerEmail: string = '';
  registerPassword: string = '';

  // Alterna entre login e registo
  toggleAuth() {
    this.isLogin = !this.isLogin;

    // Limpa os campos quando muda de form
    this.clearFields();
  }

  // Limpar campos
  private clearFields() {
    this.loginEmail = '';
    this.loginPassword = '';
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
  }

  // Simula login
  login() {
    if (!this.loginEmail || !this.loginPassword) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    console.log('Login provisório:');
    console.log('Email:', this.loginEmail);
    console.log('Password:', this.loginPassword);

    alert('Login realizado com sucesso (simulação)!');

    // Navegar para o dashboard
    this.router.navigate(['/chat-dashboard']);
  }

  // Simula registo
  register() {
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    console.log('Registo provisório:');
    console.log('Nome:', this.registerName);
    console.log('Email:', this.registerEmail);
    console.log('Password:', this.registerPassword);

    alert('Registo realizado com sucesso (simulação)!');

    // Alterna para login após registo
    this.toggleAuth();
  }
}
