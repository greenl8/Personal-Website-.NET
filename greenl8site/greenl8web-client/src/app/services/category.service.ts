import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryCreateEdit } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = environment.apiUrl + 'categories';
  
  constructor(private http: HttpClient) { }
  
  /**
   * Get all categories
   * @returns Observable with array of categories
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }
  
  /**
   * Get a specific category by ID
   * @param id Category ID
   * @returns Observable with the category
   */
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Create a new category
   * @param category CategoryCreateEdit object with category data
   * @returns Observable with the created category
   */
  createCategory(category: CategoryCreateEdit): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }
  
  /**
   * Update an existing category
   * @param id Category ID
   * @param category CategoryCreateEdit object with updated category data
   * @returns Observable with the updated category
   */
  updateCategory(id: number, category: CategoryCreateEdit): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category);
  }
  
  /**
   * Delete a category
   * @param id Category ID
   * @returns Observable with void result
   */
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}