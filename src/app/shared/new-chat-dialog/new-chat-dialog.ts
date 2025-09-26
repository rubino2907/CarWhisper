import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-chat-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-chat-dialog.html',
  styleUrl: './new-chat-dialog.css'
})
export class NewChatDialog {
  @Output() confirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  chatTitle: string = '';

  confirm() {
    if (this.chatTitle.trim()) {
      this.confirmed.emit(this.chatTitle.trim());
    }
  }

  cancel() {
    this.cancelled.emit();
  }
}
