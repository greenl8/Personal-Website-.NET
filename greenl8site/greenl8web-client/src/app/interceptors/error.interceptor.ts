import { Injectable } from '@angular/core';
import { 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpInterceptor, 
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        let actionText = 'Close';
        let duration = 5000; // 5 seconds
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
          console.error('Client error:', error.error.message);
        } else {
          // Server-side error
          switch (error.status) {
            case 0:
              // Network error or server down
              errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
              console.error('Network error or server unavailable');
              break;
              
            case 400:
              // Bad request
              errorMessage = this.handleBadRequest(error);
              console.error('Bad request error:', error);
              break;
              
            case 401:
              // Unauthorized
              errorMessage = 'Your session has expired. Please log in again.';
              console.error('Unauthorized error:', error);
              
              // Clear authentication data and redirect to login
              this.authService.logout();
              this.router.navigate(['/login'], { 
                queryParams: { returnUrl: this.router.url }
              });
              break;
              
            case 403:
              // Forbidden
              errorMessage = 'You do not have permission to perform this action.';
              console.error('Forbidden error:', error);
              break;
              
            case 404:
              // Not found
              errorMessage = 'The requested resource was not found.';
              console.error('Not found error:', error);
              break;
              
            case 422:
              // Validation error
              errorMessage = this.handleValidationError(error);
              console.error('Validation error:', error);
              break;
              
            case 500:
              // Server error
              errorMessage = 'A server error occurred. Please try again later or contact support if the problem persists.';
              console.error('Server error:', error);
              break;
              
            default:
              // Other errors
              errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText || 'Unknown error'}`;
              console.error('HTTP error:', error);
              break;
          }
        }
        
        // Show error message in snackbar
        this.snackBar.open(errorMessage, actionText, {
          duration: duration,
          panelClass: ['error-snackbar']
        });
        
        // Re-throw the error so components can also handle it if needed
        return throwError(error);
      })
    );
  }
  
  /**
   * Handle Bad Request (400) errors, which might include validation errors
   */
  private handleBadRequest(error: HttpErrorResponse): string {
    // Check if the error has a message property
    if (error.error?.message) {
      return error.error.message;
    }
    
    // Check if the error has validation errors
    if (error.error?.errors) {
      return this.formatValidationErrors(error.error.errors);
    }
    
    // Default message
    return 'The request was invalid. Please check your data and try again.';
  }
  
  /**
   * Handle Validation Error (422) responses
   */
  private handleValidationError(error: HttpErrorResponse): string {
    if (error.error?.errors) {
      return this.formatValidationErrors(error.error.errors);
    }
    
    if (error.error?.message) {
      return error.error.message;
    }
    
    return 'Validation failed. Please check your data and try again.';
  }
  
  /**
   * Format validation errors from the server into a readable message
   */
  private formatValidationErrors(errors: any): string {
    if (typeof errors === 'string') {
      return errors;
    }
    
    if (Array.isArray(errors)) {
      return errors.join(' ');
    }
    
    if (typeof errors === 'object') {
      // Extract error messages from the validation object
      const errorMessages = [];
      
      for (const key in errors) {
        if (errors.hasOwnProperty(key)) {
          const keyErrors = errors[key];
          if (Array.isArray(keyErrors)) {
            errorMessages.push(`${key}: ${keyErrors.join(', ')}`);
          } else {
            errorMessages.push(`${key}: ${keyErrors}`);
          }
        }
      }
      
      if (errorMessages.length > 0) {
        return errorMessages.join('. ');
      }
    }
    
    return 'Validation failed. Please check your data and try again.';
  }
}