import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-page',
  template: `
    <div class="error-container">
      <mat-icon><img src="assets/images/errordefault.png" alt="Error Icon" class="toolbar-img-icon"></mat-icon>
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <div class="actions">
        <button mat-raised-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Go Back
        </button>
        <button mat-raised-button color="accent" routerLink="/">
          <mat-icon>home</mat-icon>
          Home
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      text-align: center;
      padding: 2rem;
      margin: 2rem auto;
      max-width: 600px;
    }
    
    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
    }
    
    h1 {
      margin: 1rem 0;
      color: #333;
    }
    
    p {
      color: #666;
      margin-bottom: 2rem;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      
      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule]
})
export class ErrorPageComponent implements OnInit {
  title = 'Page Not Found';
  message = 'The page you are looking for does not exist.';
  icon = 'error_outline';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const errorType = this.route.snapshot.data['errorType'];
    
    switch (errorType) {
      case '403':
        this.title = 'Access Denied';
        this.message = 'You do not have permission to access this page.';
        this.icon = 'lock';
        break;
      case '500':
        this.title = 'Server Error';
        this.message = 'Something went wrong on our end. Please try again later.';
        this.icon = 'warning';
        break;
      default:
        // Keep default 404 messages
        break;
    }
  }

  goBack(): void {
    window.history.back();
  }
}