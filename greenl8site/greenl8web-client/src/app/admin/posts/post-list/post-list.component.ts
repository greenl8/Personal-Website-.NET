import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { PostService } from '../../../services/post.service';
import { Post, PostListItem, PostFilter } from '../../../models/post.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    PaginationComponent
  ],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  posts: PostListItem[] = [];
  displayedColumns: string[] = ['title', 'author', 'date', 'status', 'actions'];
  loading = false;
  filter: PostFilter = {
    page: 1,
    pageSize: 10
  };
  totalCount = 0;
  
  constructor(
    private postService: PostService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadPosts();
  }
  
  loadPosts(): void {
    this.loading = true;
    
    this.postService.getPosts(this.filter).subscribe(
      result => {
        this.posts = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error => {
        console.error('Error loading posts:', error);
        this.snackBar.open('Error loading posts', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }
  
  onPageChange(page: number): void {
    this.filter.page = page;
    this.loadPosts();
  }
  
  deletePost(post: PostListItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the post "${post.title}"?`,
        confirmButtonText: 'Delete'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.postService.deletePost(post.id).subscribe(
          () => {
            this.snackBar.open('Post deleted successfully', 'Close', { duration: 3000 });
            this.loadPosts();
          },
          error => {
            console.error('Error deleting post:', error);
            this.snackBar.open('Error deleting post', 'Close', { duration: 3000 });
          }
        );
      }
    });
  }
  
  changePostStatus(post: PostListItem): void {
    const updatedPost = {
      title: post.title,
      content: '', // Will be provided by the API
      slug: post.slug,
      isPublished: !post.isPublished,
      categoryIds: [],
      tagIds: []
    };
    
    this.postService.updatePost(post.id, updatedPost).subscribe(
      () => {
        this.snackBar.open(`Post ${post.isPublished ? 'unpublished' : 'published'} successfully`, 'Close', { duration: 3000 });
        this.loadPosts();
      },
      error => {
        console.error('Error updating post status:', error);
        this.snackBar.open('Error updating post status', 'Close', { duration: 3000 });
      }
    );
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filter.searchTerm = filterValue.trim();
    this.filter.page = 1;
    this.loadPosts();
  }
}