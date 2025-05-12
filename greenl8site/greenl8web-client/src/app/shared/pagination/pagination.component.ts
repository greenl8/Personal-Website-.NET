import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() maxPageLinks = 5; // Maximum number of page links to display
  @Input() showFirstLastButtons = true;
  @Input() showPageSizeSelector = false;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  
  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  
  pages: number[] = [];
  totalPages = 0;
  
  ngOnChanges(changes: SimpleChanges): void {
    // Recalculate pagination when inputs change
    if (changes.totalCount || changes.pageSize || changes.currentPage) {
      this.calculatePagination();
    }
  }
  
  calculatePagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
    
    // Ensure current page is within valid range
    this.currentPage = Math.max(1, Math.min(this.totalPages, this.currentPage));
    
    // Generate array of page numbers to display
    this.pages = this.getPageRange();
  }
  
  getPageRange(): number[] {
    if (this.totalPages <= this.maxPageLinks) {
      // If total pages is less than max links, show all pages
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    
    // Calculate start and end page numbers
    const halfMax = Math.floor(this.maxPageLinks / 2);
    let startPage = Math.max(1, this.currentPage - halfMax);
    let endPage = Math.min(this.totalPages, startPage + this.maxPageLinks - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < this.maxPageLinks) {
      startPage = Math.max(1, endPage - this.maxPageLinks + 1);
    }
    
    return Array.from(
      { length: endPage - startPage + 1 }, 
      (_, i) => startPage + i
    );
  }
  
  goToPage(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChanged.emit(page);
    }
  }
  
  onPageSizeChange(newPageSize: number): void {
    // When page size changes, try to keep the user at approximately the same data position
    const firstItemIndex = (this.currentPage - 1) * this.pageSize;
    const newPage = Math.floor(firstItemIndex / newPageSize) + 1;
    
    this.pageSize = newPageSize;
    this.pageSizeChanged.emit(newPageSize);
    
    // After page size is updated, go to the calculated page
    this.goToPage(newPage);
  }
  
  hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }
  
  hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }
  
  getDisplayedItemRange(): { start: number; end: number } {
    const start = this.totalCount === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, this.totalCount);
    return { start, end };
  }
}