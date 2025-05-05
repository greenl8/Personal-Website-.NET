import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl + 'auth';
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }
  
  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(this.baseUrl + '/login', { username, password })
      .pipe(
        tap(user => {
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSource.next(user);
          }
        })
      );
  }
  
  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }
  
  getCurrentUser(): Observable<User | null> {
    if (this.currentUserSource.value) {
      return of(this.currentUserSource.value);
    }
    
    return this.http.get<User>(this.baseUrl + '/current')
      .pipe(
        tap(user => {
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSource.next(user);
          }
        })
      );
  }
  
  isAdmin(): boolean {
    return this.currentUserSource.value?.role === 'Admin';
  }
  
  private loadStoredUser(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      this.currentUserSource.next(user);
    }
  }
}