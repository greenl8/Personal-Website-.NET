import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, PostListItem, PostCreateEdit, PostFilter } from '../models/post.model';
import { PaginatedResult } from '../models/pagination.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseUrl = environment.apiUrl + 'posts';
  
  constructor(private http: HttpClient) { }
  
  getPosts(filter: PostFilter): Observable<PaginatedResult<PostListItem>> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());
      
    if (filter.isPublished !== undefined) {
      params = params.set('isPublished', filter.isPublished.toString());
    }
    
    if (filter.categoryId) {
      params = params.set('categoryId', filter.categoryId.toString());
    }
    
    if (filter.tagId) {
      params = params.set('tagId', filter.tagId.toString());
    }
    
    if (filter.searchTerm) {
      params = params.set('searchTerm', filter.searchTerm);
    }
    
    return this.http.get<PaginatedResult<PostListItem>>(this.baseUrl, { params });
  }
  
  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${id}`);
  }
  
  getPostBySlug(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/by-slug/${slug}`);
  }
  
  createPost(post: PostCreateEdit): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, post);
  }
  
  updatePost(id: number, post: PostCreateEdit): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/${id}`, post);
  }
  
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  
  togglePublishStatus(id: number): Observable<Post> {
    return this.http.patch<Post>(`${this.baseUrl}/${id}/toggle-publish`, {});
  }
}