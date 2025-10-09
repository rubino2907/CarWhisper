import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // necessário para ngModel

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css'],
  standalone: true,
})
export class UserProfile implements OnInit {
  user: User | null = null;
  error: string | null = null;

  editMode = false; // controla se está editando
  editData: { username: string; email: string } = { username: '', email: '' }; // cópia temporária

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  private loadUser() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.ngZone.run(() => {
          this.user = {
            ...user,
            createdAt: (user as any).createdAt || new Date().toISOString(),
          };
          // Inicializa editData com os valores atuais
          this.editData = { username: this.user.username, email: this.user.email };
        });
      },
      error: (err: any) => {
        console.error('Erro ao carregar user:', err);
        this.ngZone.run(() => {
          this.error = err.message || 'Erro ao carregar perfil';
        });
      },
    });
  }

  goBack() {
    this.router.navigate(['/chat-dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ativa o modo de edição
  enableEdit() {
    if (!this.user) return;
    this.editMode = true;
    this.editData = { username: this.user.username, email: this.user.email };
  }

  // cancela a edição
  cancelEdit() {
    this.editMode = false;
    if (this.user) {
      this.editData = { username: this.user.username, email: this.user.email };
    }
  }

  // salva alterações (comentado para já, até implementar o service)
  async saveProfile() {
    if (!this.user) return;

    // Para já apenas atualiza localmente (frontend)
    this.user.username = this.editData.username;
    this.user.email = this.editData.email;
    this.editMode = false;

    /*
    try {
      const updatedUser = await this.userService.updateUser({
        ...this.user,
        username: this.editData.username,
        email: this.editData.email
      });

      this.ngZone.run(() => {
        this.user = updatedUser;
        this.editMode = false;
      });
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      this.ngZone.run(() => {
        this.error = err.message || 'Erro ao salvar perfil';
      });
    }
    */
  }
}
