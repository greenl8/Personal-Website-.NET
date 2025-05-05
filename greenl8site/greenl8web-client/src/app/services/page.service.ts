import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, PageListItem, PageCreateEdit } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private baseUrl = environment.apiUrl + 'pages';
  
  constructor(private http: HttpClient) { }
  
  getPages(): Observable<PageListItem[]> {
    return this.http.get<PageListItem[]>(this.baseUrl);
  }
  
  getPage(id: number): Observable<Page> {
    return this.http.get<Page>(`${this.baseUrl}/${id}`);
  }
  
  getPageBySlug(slug: string): Observable<Page> {
    return this.http.get<Page>(`${this.baseUrl}/by-slug/${slug}`);
  }
  
  createPage(page: PageCreateEdit): Observable<Page> {
    return this.http.post<Page>(this.baseUrl, page);
  }
  
  updatePage(id: number, page: PageCreateEdit): Observable<Page> {
    return this.http.put<Page>(`${this.baseUrl}/${id}`, page);
  }
  
  deletePage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}