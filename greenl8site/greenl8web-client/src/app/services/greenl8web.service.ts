import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HelloWorldService {
  // Updated for HTTPS compatibility - v1.0.2
  private apiUrl = environment.apiUrl + 'test';

  constructor(private http: HttpClient) { }

  getMessage(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
