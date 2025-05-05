import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaService } from '../../../services/media.service';
import { Media, MediaFilter } from '../../../models/media.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-media-library',
  templateUrl: './media-library.component.html',
  styleUrls: ['./media-library.component.scss']

    , standalone: true,

    imports: [ MatCard,
        MatIcon,
        MatCardContent,
        MatLabel,
        MatFormField]
})
export class MediaLibraryComponent implements OnInit {
  mediaItems: Media[] = [];
  loading = false;
  uploading = false;
  filter: MediaFilter = {
    page: 1,
    pageSize: 20
  };
  totalCount = 0;
  
  constructor(
    private mediaService: MediaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadMedia();
  }
  
  loadMedia(): void {
    this.loading = true;
    
    this.mediaService.getMedia(this.filter).subscribe(
      result => {
        this.mediaItems = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error => {
        console.error('Error loading media:', error);
        this.snackBar.open('Error loading media', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }
  
  onPageChange(page: number): void {
    this.filter.page = page;
    this.loadMedia();
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      this.uploadFile(file);
    }
  }
  
  uploadFile(file: File): void {
    this.uploading = true;
    
    this.mediaService.uploadMedia(file).subscribe(
      () => {
        this.snackBar.open('File uploaded successfully', 'Close', { duration: 3000 });
        this.loadMedia();
        this.uploading = false;
      },
      error => {
        console.error('Error uploading file:', error);
        this.snackBar.open('Error uploading file', 'Close', { duration: 3000 });
        this.uploading = false;
      }
    );
  }
  
  deleteMedia(media: Media): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the file "${media.fileName}"?`,
        confirmButtonText: 'Delete'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mediaService.deleteMedia(media.id).subscribe(
          () => {
            this.snackBar.open('File deleted successfully', 'Close', { duration: 3000 });
            this.loadMedia();
          },
          error => {
            console.error('Error deleting file:', error);
            this.snackBar.open('Error deleting file', 'Close', { duration: 3000 });
          }
        );
      }
    });
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filter.searchTerm = filterValue.trim();
    this.filter.page = 1;
    this.loadMedia();
  }
  
  filterByType(fileType: string): void {
    this.filter.fileType = fileType;
    this.filter.page = 1;
    this.loadMedia();
  }
  
  clearFilters(): void {
    this.filter = {
      page: 1,
      pageSize: 20
    };
    this.loadMedia();
  }
}