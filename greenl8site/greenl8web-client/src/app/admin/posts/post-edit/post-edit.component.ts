import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

// Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// Services and Models
import { PostService } from '../../../services/post.service';
import { CategoryService } from '../../../services/category.service';
import { TagService } from '../../../services/tag.service';
import { MediaSelectorComponent } from '../../../shared/media-selector/media-selector-dialog.component';

import { Post } from '../../../models/post.model';
import { Category } from '../../../models/category.model';
import { Tag } from '../../../models/tag.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { AddCategoryDialogComponent } from '../../../shared/add-category-dialog/add-category-dialog.component';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatListModule,
    MatAutocompleteModule,
    MediaSelectorComponent
  ],
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss']
})
export class PostEditComponent implements OnInit {

    onDelete(): void {
        if (!this.isEditing) {
          return; // Can't delete a post that doesn't exist yet
        }
      
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          data: {
            title: 'Delete Post',
            message: `Are you sure you want to delete "${this.post.title}"? This action cannot be undone.`,
            confirmButtonText: 'Delete',
            color: 'warn'
          }
        });
      
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.submitting = true;
            
            this.postService.deletePost(this.postId).subscribe(
              () => {
                this.snackBar.open('Post deleted successfully', 'Close', { duration: 3000 });
                this.router.navigate(['/admin/posts']);
              },
              error => {
                console.error('Error deleting post:', error);
                this.snackBar.open('Error deleting post', 'Close', { duration: 3000 });
                this.submitting = false;
              }
            );
          }
        });
      
}


onDuplicate(): void {
    if (!this.isEditing) {
      return; // Can't duplicate a post that doesn't exist yet
    }
  
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Duplicate Post',
        message: `Create a duplicate copy of "${this.post.title}"?`,
        confirmButtonText: 'Duplicate',
        color: 'primary'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Create a new post object based on current one
        const newPost = {
          title: `${this.post.title} (Copy)`,
          content: this.post.content,
          excerpt: this.post.excerpt,
          featuredImage: this.post.featuredImage,
          isPublished: false, // Always start as draft
          categoryIds: this.postForm.get('categoryIds').value || [],
          tagIds: this.postForm.get('tagIds').value || []
        };
        
        this.submitting = true;
        
        this.postService.createPost(newPost).subscribe(
          (createdPost) => {
            this.snackBar.open('Post duplicated successfully', 'Close', { duration: 3000 });
            // Navigate to the new post
            this.router.navigate(['/admin/posts/edit', createdPost.id]);
          },
          error => {
            console.error('Error duplicating post:', error);
            this.snackBar.open('Error duplicating post', 'Close', { duration: 3000 });
            this.submitting = false;
          }
        );
      }
    });
  }

  @ViewChild('mediaSelector') mediaSelector: MediaSelectorComponent;
  
  postForm: FormGroup;
  post: Post;
  categories: Category[] = [];
  tags: Tag[] = [];
  isEditing = false;
  postId: number;
  loading = true;
  submitting = false;
  previewMode = false;
  
  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private categoryService: CategoryService,
    private tagService: TagService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) { }
  
  ngOnInit(): void {
    this.createForm();
    this.loadData();
  }
  
  createForm(): void {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      slug: [''],
      excerpt: [''],
      featuredImage: [''],
      isPublished: [false],
      categoryIds: [[]],
      tagIds: [[]]
    });
  }
  
  loadData(): void {
    // Check if we're editing an existing post
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.postId = +id;
      
      // Load categories, tags, and post data in parallel
      forkJoin({
        categories: this.categoryService.getCategories(),
        tags: this.tagService.getTags(),
        post: this.postService.getPost(this.postId)
      }).subscribe(
        result => {
          this.categories = result.categories;
          this.tags = result.tags;
          this.post = result.post;
          
          // Populate the form with the post data
          this.postForm.patchValue({
            title: this.post.title,
            content: this.post.content,
            slug: this.post.slug,
            excerpt: this.post.excerpt || '',
            featuredImage: this.post.featuredImage || '',
            isPublished: this.post.isPublished,
            categoryIds: this.post.categories.map(c => c.id),
            tagIds: this.post.tags.map(t => t.id)
          });
          
          this.loading = false;
        },
        error => {
          console.error('Error loading data:', error);
          this.snackBar.open('Error loading post data', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/posts']);
        }
      );
    } else {
      // Just load categories and tags for a new post
      forkJoin({
        categories: this.categoryService.getCategories(),
        tags: this.tagService.getTags()
      }).subscribe(
        result => {
          this.categories = result.categories;
          this.tags = result.tags;
          this.loading = false;
        },
        error => {
          console.error('Error loading data:', error);
          this.snackBar.open('Error loading categories and tags', 'Close', { duration: 3000 });
        }
      );
    }
  }
  
  onSubmit(): void {
    if (this.postForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.postForm.controls).forEach(key => {
        const control = this.postForm.get(key);
        control.markAsTouched();
      });
      return;
    }
    
    this.submitting = true;
    const postData = this.postForm.value;
    
    // Check for empty excerpt and set to null if needed
    if (!postData.excerpt) {
      postData.excerpt = null;
    }
    
    // Save the post
    if (this.isEditing) {
      this.postService.updatePost(this.postId, postData).subscribe(
        result => {
          this.snackBar.open('Post updated successfully', 'Close', { duration: 3000 });
          this.submitting = false;
          
          // Navigate back to posts list
          this.router.navigate(['/admin/posts']);
        },
        error => {
          console.error('Error updating post:', error);
          this.snackBar.open('Error updating post', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      );
    } else {
      this.postService.createPost(postData).subscribe(
        result => {
          this.snackBar.open('Post created successfully', 'Close', { duration: 3000 });
          this.submitting = false;
          
          // Navigate back to posts list
          this.router.navigate(['/admin/posts']);
        },
        error => {
          console.error('Error creating post:', error);
          this.snackBar.open('Error creating post', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      );
    }
  }

  onSaveDraft(): void {
    // Ensure the post is marked as unpublished
    this.postForm.patchValue({ isPublished: false });
    this.onSubmit();
  }

  onPublish(): void {
    // If this is a new post, mark it as published
    if (!this.isEditing) {
      this.postForm.patchValue({ isPublished: true });
    }
    // If editing, keep the current published status
    this.onSubmit();
  }

  isFullscreen = false;
toggleFullscreen(): void {
  this.isFullscreen = !this.isFullscreen;
  
  if (this.isFullscreen) {
    // Add class to host element for fullscreen styling
    this.elementRef.nativeElement.classList.add('fullscreen');
  } else {
    // Remove class from host element
    this.elementRef.nativeElement.classList.remove('fullscreen');
  }
}

/**
 * Helper method to compare IDs in selection lists
 */
compareIds(id1: number, id2: number): boolean {
  return id1 === id2;
}

/**
 * Remove image from post
 */
removeImage(): void {
  this.postForm.patchValue({ featuredImage: '' });
}

/**
 * Open dialog to add a new category
 */
loadCategories(): void {
  this.categoryService.getCategories().subscribe(
    (categories) => {
      this.categories = categories;
    },
    (error) => {
      console.error('Error loading categories:', error);
      this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
    }
  );
}

openAddCategoryDialog(): void {
  const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
    width: '400px'
  });
  
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Reload categories
      this.loadCategories();
      
      // Add the new category to the selected categories
      const currentCategoryIds = this.postForm.get('categoryIds').value || [];
      this.postForm.patchValue({
        categoryIds: [...currentCategoryIds, result.id]
      });
    }
  });
}
  
  onPreview(): void {
    this.previewMode = !this.previewMode;
  }
  
  onSelectFeaturedImage(url: string): void {
    this.postForm.patchValue({ featuredImage: url });
  }
  
  generateSlug(): void {
    const title = this.postForm.get('title').value;
    if (title) {
      // Convert to lowercase and replace spaces with hyphens
      let slug = title.toLowerCase().replace(/\s+/g, '-');
      
      // Remove special characters
      slug = slug.replace(/[^a-z0-9-]/g, '');
      
      // Remove multiple hyphens
      slug = slug.replace(/-+/g, '-');
      
      // Trim hyphens from beginning and end
      slug = slug.replace(/^-+|-+$/g, '');
      
      this.postForm.patchValue({ slug });
    }
  }
  
  onCancel(): void {
    if (this.postForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Discard Changes',
          message: 'You have unsaved changes. Are you sure you want to discard them?',
          confirmButtonText: 'Discard'
        }
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/admin/posts']);
        }
      });
    } else {
      this.router.navigate(['/admin/posts']);
    }
  }
  
  openMediaSelector(): void {
    this.mediaSelector.open();
  }
}