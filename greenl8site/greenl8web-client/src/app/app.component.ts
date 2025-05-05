import { Component, OnInit } from '@angular/core';
import { HelloWorldService } from './services/greenl8web.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
  ]
})
export class AppComponent implements OnInit {
  title = 'hello-world-client';
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