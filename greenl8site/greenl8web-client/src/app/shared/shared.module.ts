import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Shared components
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { MediaSelectorComponent, MediaSelectorDialogComponent } from './media-selector/media-selector-dialog.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RichTextEditorComponent,
    MediaSelectorComponent,
    ConfirmDialogComponent,
    PaginationComponent, // Import standalone component here
    MediaSelectorDialogComponent // Import standalone component here
  ],
  exports: [
    // Re-export common modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // Re-export Material modules
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    
    // Export components
    RichTextEditorComponent,
    MediaSelectorComponent,
    PaginationComponent,
    ConfirmDialogComponent
  ],
  // Removed entryComponents as it is no longer required in Angular 9+
})
export class SharedModule { }