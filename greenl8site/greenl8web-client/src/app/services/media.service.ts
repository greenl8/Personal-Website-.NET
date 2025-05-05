import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Media, MediaFilter } from '../models/media.model';
import { PaginatedResult } from '../models/pagination.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private baseUrl = environment.apiUrl + 'media';
  
  constructor(private http: HttpClient) { }
  
  getMedia(filter: MediaFilter): Observable<PaginatedResult<Media>> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());
      
    if (filter.searchTerm) {
      params = params.set('searchTerm', filter.searchTerm);
    }
    
    if (filter.fileType) {
      params = params.set('fileType', filter.fileType);
    }
    
    return this.http.get<PaginatedResult<Media>>(this.baseUrl, { params });
  }
  
  uploadMedia(file: File): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<Media>(this.baseUrl, formData);
  }
  
  deleteMedia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}