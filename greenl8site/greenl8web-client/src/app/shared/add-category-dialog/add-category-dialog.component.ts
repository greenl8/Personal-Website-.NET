import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoryService } from '../../services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryCreateEdit } from '../../models/category.model';

@Component({
  selector: 'app-add-category-dialog',
  templateUrl: './add-category-dialog.component.html',
  styleUrls: ['./add-category-dialog.component.scss'],

    standalone: true,

    imports: [CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressSpinnerModule]
})
export class AddCategoryDialogComponent {
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