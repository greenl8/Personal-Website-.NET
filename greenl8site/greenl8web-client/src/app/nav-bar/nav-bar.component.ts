import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],

  imports: [ 
    CommonModule,
    MatToolbarModule,
    MatMenuModule
  ],
  standalone: true
})
export class NavBarComponent implements OnInit {
  currentUser$: Observable<User>;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}