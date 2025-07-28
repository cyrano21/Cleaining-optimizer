import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  template: `
    <div class="container">
      <header>
        <h1>Welcome to Angular!</h1>
        <img src="/angular.svg" alt="Angular Logo" class="logo" />
      </header>
      
      <main>
        <p>This is a basic Angular starter template.</p>
        <div class="counter">
          <button (click)="decrement()">-</button>
          <span>{{ count }}</span>
          <button (click)="increment()">+</button>
        </div>
        <p>Count: {{ count }}</p>
      </main>
      
      <footer>
        <p>Built with Angular {{ angularVersion }}</p>
      </footer>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .logo {
      height: 6rem;
      margin: 1rem 0;
    }
    
    h1 {
      color: #dd0031;
      margin-bottom: 1rem;
    }
    
    .counter {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin: 2rem 0;
    }
    
    button {
      background: #dd0031;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.2rem;
    }
    
    button:hover {
      background: #c50025;
    }
    
    span {
      font-size: 1.5rem;
      font-weight: bold;
      min-width: 3rem;
    }
    
    footer {
      margin-top: 2rem;
      color: #666;
    }
  `]
})
export class AppComponent {
  title = 'angular-starter';
  count = 0;
  angularVersion = '17';
  
  increment() {
    this.count++;
  }
  
  decrement() {
    this.count--;
  }
}