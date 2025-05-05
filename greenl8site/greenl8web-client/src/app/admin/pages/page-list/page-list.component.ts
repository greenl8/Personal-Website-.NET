import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageService } from '../../../services/page.service';
import { PageListItem } from '../../../models/page.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.scss']

    , standalone: true,
    imports: [ MatIcon,
        MatCard,
        MatCardContent]
})
export class PageListComponent implements OnInit {
  pages: PageListItem[] = [];
  displayedColumns: string[] = ['title', 'author', 'date', 'status', 'actions'];
  loading = false;
  
  constructor(
    private pageService: PageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadPages();
  }
  
  loadPages(): void {
    this.loading = true;
    
    this.pageService.getPages().subscribe(
      pages => {
        this.pages = pages;
        this.loading = false;
      },
      error => {
        console.error('Error loading pages:', error);
        this.snackBar.open('Error loading pages', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }
  
  deletePage(page: PageListItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the page "${page.title}"?`,
        confirmButtonText: 'Delete'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pageService.deletePage(page.id).subscribe(
          () => {
            this.snackBar.open('Page deleted successfully', 'Close', { duration: 3000 });
            this.loadPages();
          },
          error => {
            console.error('Error deleting page:', error);
            this.snackBar.open('Error deleting page', 'Close', { duration: 3000 });
          }
        );
      }
    });
  }
  
  changePageStatus(page: PageListItem): void {
    const updatedPage = {
      title: page.title,
      content: '', // Will be provided by the API
      slug: page.slug,
      isPublished: !page.isPublished
    };
    
    this.pageService.updatePage(page.id, updatedPage).subscribe(
      () => {
        this.snackBar.open(`Page ${page.isPublished ? 'unpublished' : 'published'} successfully`, 'Close', { duration: 3000 });
        this.loadPages();
      },
      error => {
        console.error('Error updating page status:', error);
        this.snackBar.open('Error updating page status', 'Close', { duration: 3000 });
      }
    );
  }
}