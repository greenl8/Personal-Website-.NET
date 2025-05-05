import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelloWorldService {
  private apiUrl = 'http://localhost:5046/api/test'; // Adjust port as needed for your .NET app

  constructor(private http: HttpClient) { }

  getMessage(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
