import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TagService } from '../../../services/tag.service';
import { Tag, TagCreateEdit } from '../../../models/tag.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],

  imports: 
    [ MatCardContent,
        MatCard,
        MatCardTitle,
        MatCardHeader,
        MatFormField,
        MatLabel,
        MatFormField,
        ReactiveFormsModule

    ],
        
  standalone: true,
})
export class TagListComponent implements OnInit {
  tags: Tag[] = [];
  displayedColumns: string[] = ['name', 'slug', 'actions'];
  loading = false;
  
  tagForm: FormGroup;
  isEditing = false;
  editingTagId: number;
  
  constructor(
    private tagService: TagService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    this.loadTags();
  }
  
  createForm(): void {
    this.tagForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['']
    });
  }
  
  loadTags(): void {
    this.loading = true;
    
    this.tagService.getTags().subscribe(
      tags => {
        this.tags = tags;
        this.loading = false;
      },
      error => {
        console.error('Error loading tags:', error);
        this.snackBar.open('Error loading tags', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }
  
  onSubmit(): void {
    if (this.tagForm.invalid) {
      return;
    }
    
    const tagData: TagCreateEdit = this.tagForm.value;
    
    if (this.isEditing) {
      this.tagService.updateTag(this.editingTagId, tagData).subscribe(
        () => {
          this.snackBar.open('Tag updated successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.loadTags();
        },
        error => {
          console.error('Error updating tag:', error);
          this.snackBar.open('Error updating tag', 'Close', { duration: 3000 });
        }
      );
    } else {
      this.tagService.createTag(tagData).subscribe(
        () => {
          this.snackBar.open('Tag created successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.loadTags();
        },
        error => {
          console.error('Error creating tag:', error);
          this.snackBar.open('Error creating tag', 'Close', { duration: 3000 });
        }
      );
    }
  }
  
  editTag(tag: Tag): void {
    this.isEditing = true;
    this.editingTagId = tag.id;
    
    this.tagForm.patchValue({
      name: tag.name,
      slug: tag.slug
    });
  }
  
  deleteTag(tag: Tag): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the tag "${tag.name}"?`,
        confirmButtonText: 'Delete'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tagService.deleteTag(tag.id).subscribe(
          () => {
            this.snackBar.open('Tag deleted successfully', 'Close', { duration: 3000 });
            this.loadTags();
          },
          error => {
            console.error('Error deleting tag:', error);
            this.snackBar.open('Error deleting tag', 'Close', { duration: 3000 });
          }
        );
      }
    });
  }
  
  resetForm(): void {
    this.isEditing = false;
    this.editingTagId = null;
    this.tagForm.reset();
  }
}