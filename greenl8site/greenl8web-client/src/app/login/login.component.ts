import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
    imports: [
        MatCardHeader,
        MatCardTitle,
        MatCard,
        MatLabel,
        MatFormField,
        MatCardContent,
        MatFormField,
        ReactiveFormsModule
    ],
  standalone: true
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string;
  loading = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    // Redirect if already logged in
    if (this.authService.currentUser$) {
      this.router.navigate(['/']);
    }
  }
  
  ngOnInit(): void {
    this.createLoginForm();
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  
  createLoginForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    this.authService.login(
      this.loginForm.get('username').value,
      this.loginForm.get('password').value
    ).subscribe(
      () => {
        this.router.navigate([this.returnUrl]);
      },
      error => {
        this.snackBar.open('Login failed: ' + (error.error || 'Invalid credentials'), 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    );
  }
}