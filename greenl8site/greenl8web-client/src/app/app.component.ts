import { Component, OnInit } from '@angular/core';
import { HelloWorldService } from './services/greenl8web.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatFormFieldModule
  ]
})
export class AppComponent implements OnInit {
  title = 'Greenl8 Website';
  message: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(private helloWorldService: HelloWorldService) { }

  ngOnInit(): void {
    this.getHelloMessage();
  }

  getHelloMessage(): void {
    this.helloWorldService.getMessage()
      .subscribe({
        next: (response) => {
          this.message = response.message;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load message from server';
          this.loading = false;
          console.error('Error fetching message:', error);
        }
      });
  }
}