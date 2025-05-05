import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../../services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryCreateEdit } from '../../models/category.model';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-add-category-dialog',
  templateUrl: './add-category-dialog.component.html',
  styleUrls: ['./add-category-dialog.component.scss'],

    standalone: true,

    imports: [MatLabel,
        MatDialogActions,
        MatHint,
        MatIcon,
        MatFormField,
        ReactiveFormsModule,
        MatDialogContent]
})
export class AddCategoryDialogComponent implements OnInit {
  categoryForm: FormGroup;
  submitting = false;
  
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<AddCategoryDialogComponent>,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      slug: ['']
    });
  }
  
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }
    
    this.submitting = true;
    const categoryData: CategoryCreateEdit = this.categoryForm.value;
    
    this.categoryService.createCategory(categoryData).subscribe(
      result => {
        this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(result);
      },
      error => {
        console.error('Error creating category:', error);
        this.snackBar.open('Error creating category', 'Close', { duration: 3000 });
        this.submitting = false;
      }
    );
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  /**
   * Generate slug from category name
   */
  generateSlug(): void {
    const name = this.categoryForm.get('name').value;
    if (name) {
      // Convert to lowercase and replace spaces with hyphens
      let slug = name.toLowerCase().replace(/\s+/g, '-');
      
      // Remove special characters
      slug = slug.replace(/[^a-z0-9-]/g, '');
      
      // Remove multiple hyphens
      slug = slug.replace(/-+/g, '-');
      
      // Trim hyphens from beginning and end
      slug = slug.replace(/^-+|-+$/g, '');
      
      this.categoryForm.patchValue({ slug });
    }
  }
}