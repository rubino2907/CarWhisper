import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // router-outlet para renderizar rotas
  template: `<router-outlet></router-outlet>`,
})
export class App {}
