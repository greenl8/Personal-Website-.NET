import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MediaService } from '../../services/media.service';
import { Media, MediaFilter } from '../../models/media.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';

// Media Selector Dialog Component
@Component({
  selector: 'app-media-selector-dialog',
  templateUrl: './media-selector-dialog.component.html',
  styleUrls: ['./media-selector-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatLabel,
    MatFormField
    // other imports
  ],
  standalone: true
  
})
export class MediaSelectorDialogComponent implements OnInit {
  mediaItems: Media[] = [];
  loading = false;
  uploading = false;
  filter: MediaFilter = {
    page: 1,
    pageSize: 20
  };
  totalCount = 0;
  selectedMedia: Media | null = null;
  
  constructor(
    private mediaService: MediaService,
    private dialogRef: MatDialogRef<MediaSelectorDialogComponent>,
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
      media => {
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
  
  selectMedia(media: Media): void {
    this.selectedMedia = media;
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
  
  confirm(): void {
    this.dialogRef.close(this.selectedMedia);
  }
  
  cancel(): void {
    this.dialogRef.close();
  }
}

// Main Media Selector Component
@Component({
  selector: 'app-media-selector',
  template: ''
})
export class MediaSelectorComponent {
  @Output() mediaSelected = new EventEmitter<string>();
  
  constructor(private dialog: MatDialog) {}
  
  open(): void {
    const dialogRef = this.dialog.open(MediaSelectorDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mediaSelected.emit(result.url);
      }
    });
  }
}