import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { PostListItem, PostFilter } from '../../models/post.model';
import { PaginatedResult } from '../../models/pagination.model';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatList, MatNavList } from '@angular/material/list';
import { MatCard, MatCardHeader, MatCardModule, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatLabel,
    MatFormField,
    MatNavList,
    MatCardHeader,
    MatCardTitle,
    MatCardModule
    // other imports
  ],
  standalone: true
})
export class HomeComponent implements OnInit {
  posts: PostListItem[] = [];
  categories: Category[] = [];
  filter: PostFilter = {
    page: 1,
    pageSize: 10,
    isPublished: true
  };
  totalCount = 0;
  loading = false;
  
  constructor(
    private postService: PostService,
    private categoryService: CategoryService
  ) {}
  
  ngOnInit(): void {
    this.loadPosts();
    this.loadCategories();
  }
  
  loadPosts(): void {
    this.loading = true;
    
    this.postService.getPosts(this.filter).subscribe(
      (result: PaginatedResult<PostListItem>) => {
        this.posts = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error => {
        console.error('Error loading posts:', error);
        this.loading = false;
      }
    );
  }
  
  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (categories: Category[]) => {
        this.categories = categories;
      },
      error => {
        console.error('Error loading categories:', error);
      }
    );
  }
  
  onPageChange(page: number): void {
    this.filter.page = page;
    this.loadPosts();
    window.scrollTo(0, 0);
  }
  
  filterByCategory(categoryId: number): void {
    this.filter.categoryId = this.filter.categoryId === categoryId ? undefined : categoryId;
    this.filter.page = 1;
    this.loadPosts();
  }
  
  search(term: string): void {
    this.filter.searchTerm = term;
    this.filter.page = 1;
    this.loadPosts();
  }
  
  clearFilters(): void {
    this.filter = {
      page: 1,
      pageSize: 10,
      isPublished: true
    };
    this.loadPosts();
  }
}