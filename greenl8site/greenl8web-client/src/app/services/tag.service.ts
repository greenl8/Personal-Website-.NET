import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag, TagCreateEdit } from '../models/tag.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private baseUrl = environment.apiUrl + 'tags';
  
  constructor(private http: HttpClient) { }
  
  /**
   * Get all tags
   * @returns Observable with array of tags
   */
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.baseUrl);
  }
  
  /**
   * Get a specific tag by ID
   * @param id Tag ID
   * @returns Observable with the tag
   */
  getTag(id: number): Observable<Tag> {
    return this.http.get<Tag>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Create a new tag
   * @param tag TagCreateEdit object with tag data
   * @returns Observable with the created tag
   */
  createTag(tag: TagCreateEdit): Observable<Tag> {
    return this.http.post<Tag>(this.baseUrl, tag);
  }
  
  /**
   * Update an existing tag
   * @param id Tag ID
   * @param tag TagCreateEdit object with updated tag data
   * @returns Observable with the updated tag
   */
  updateTag(id: number, tag: TagCreateEdit): Observable<Tag> {
    return this.http.put<Tag>(`${this.baseUrl}/${id}`, tag);
  }
  
  /**
   * Delete a tag
   * @param id Tag ID
   * @returns Observable with void result
   */
  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Get popular tags (tags with the most posts)
   * @param limit Maximum number of tags to return
   * @returns Observable with array of popular tags
   */
  getPopularTags(limit: number = 10): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/popular`, {
      params: { limit: limit.toString() }
    });
  }
  
  /**
   * Search for tags by name
   * @param searchTerm Search term to filter tags by name
   * @returns Observable with array of matching tags
   */
  searchTags(searchTerm: string): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/search`, {
      params: { term: searchTerm }
    });
  }
}