import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  color?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    
    // other imports
  ],
  standalone: true
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { 
    // Set defaults if not provided
    this.data.cancelButtonText = this.data.cancelButtonText || 'Cancel';
    this.data.color = this.data.color || 'warn';
  }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}