import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true, 
  imports: [RouterModule], 
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  constructor(private router: Router) {}

  goToChatDashboard() {
    this.router.navigate(['/chat-dashboard']); // funciona em button
  }
}
