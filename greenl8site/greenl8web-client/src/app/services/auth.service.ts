import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl + 'auth';
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStoredUser();
    }
  }
  
  login(username: string, password: string): Observable<User> {
    return this.http.post<any>(this.baseUrl + '/login', { username, password })
      .pipe(
        map(rawUser => this.normalizeUser(rawUser)),
        tap(user => {
          if (user && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSource.next(user);
          }
        })
      );
  }
  
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
    }
    this.currentUserSource.next(null);
  }
  
  getCurrentUser(): Observable<User | null> {
    if (this.currentUserSource.value) {
      return of(this.currentUserSource.value);
    }
    
    return this.http.get<any>(this.baseUrl + '/current')
      .pipe(
        map(rawUser => this.normalizeUser(rawUser)),
        tap(user => {
          if (user && isPlatformBrowser(this.platformId)) {
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
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const rawUser = JSON.parse(userJson);
        const user = this.normalizeUser(rawUser);
        this.currentUserSource.next(user);
      }
    }
  }
  
  /**
   * Normalize the user object coming from the backend or localStorage.
   * Ensures the JWT property is always available as `token` (camelCase)
   * regardless of whether the backend serialized it as `token` or `Token`.
   */
  private normalizeUser(rawUser: any): User {
    if (!rawUser) {
      return rawUser;
    }

    // Map Token -> token if necessary
    if (!rawUser.token && rawUser.Token) {
      rawUser.token = rawUser.Token;
    }

    return rawUser as User;
  }
}