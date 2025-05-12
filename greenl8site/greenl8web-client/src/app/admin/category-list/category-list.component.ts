import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { CategoryService } from '../../services/category.service';
import { Category, CategoryCreateEdit } from '../../models/category.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  displayedColumns: string[] = ['name', 'slug', 'actions'];
  loading = false;
  
  categoryForm: FormGroup;
  isEditing = false;
  editingCategoryId: number;
  
  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    this.loadCategories();
  }
  
  createForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['']
    });
  }
  
  loadCategories(): void {
    this.loading = true;
    
    this.categoryService.getCategories().subscribe(
      categories => {
        this.categories = categories;
        this.loading = false;
      },
      error => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }
  
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }
    
    const categoryData: CategoryCreateEdit = this.categoryForm.value;
    
    if (this.isEditing) {
      this.categoryService.updateCategory(this.editingCategoryId, categoryData).subscribe(
        () => {
          this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.loadCategories();
        },
        error => {
          console.error('Error updating category:', error);
          this.snackBar.open('Error updating category', 'Close', { duration: 3000 });
        }
      );
    } else {
      this.categoryService.createCategory(categoryData).subscribe(
        () => {
          this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.loadCategories();
        },
        error => {
          console.error('Error creating category:', error);
          this.snackBar.open('Error creating category', 'Close', { duration: 3000 });
        }
      );
    }
  }
  
  editCategory(category: Category): void {
    this.isEditing = true;
    this.editingCategoryId = category.id;
    
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug
    });
  }
  
  deleteCategory(category: Category): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the category "${category.name}"?`,
        confirmButtonText: 'Delete'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.deleteCategory(category.id).subscribe(
          () => {
            this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
            this.loadCategories();
          },
          error => {
            console.error('Error deleting category:', error);
            this.snackBar.open('Error deleting category', 'Close', { duration: 3000 });
          }
        );
      }
    });
  }
  
  resetForm(): void {
    this.isEditing = false;
    this.editingCategoryId = null;
    this.categoryForm.reset();
  }
}