import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable, of, startWith, map, BehaviorSubject } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

// Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule, MatChipInputEvent, MatChipGrid } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

// Services and Models
import { PostService } from '../../../services/post.service';
import { CategoryService } from '../../../services/category.service';
import { TagService } from '../../../services/tag.service';
import { MediaSelectorComponent } from '../../../shared/media-selector/media-selector-dialog.component';
import { RichTextEditorComponent } from '../../../shared/rich-text-editor/rich-text-editor.component';

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
    MediaSelectorComponent,
    RichTextEditorComponent
  ],
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss']
})
export class PostEditComponent implements OnInit {

  @ViewChild('mediaSelector') mediaSelector: MediaSelectorComponent;
  @ViewChild('chipList') chipList: MatChipGrid;
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  
  postForm: FormGroup;
  post: Post;
  categories: Category[] = [];
  tags: Tag[] = [];
  popularTags: Tag[] = [];
  filteredTags$: Observable<Tag[]>;
  private tagsLoaded = new BehaviorSubject<boolean>(false);

  isEditing = false;
  postId: number;
  loading = true;
  submitting = false;
  previewMode = false;
  baseUrl = 'yourdomain.com/blog';

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  
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
    this.filteredTags$ = this.postForm.get('tagInputCtrl').valueChanges.pipe(
      startWith(''),
      map((tagName: string | null) => this._filterTags(tagName || ''))
    );
  }
  
  createForm(): void {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      slug: [''],
      excerpt: [''],
      featuredImage: [''],
      videoEmbedCode: [''],
      videoUrl: [''], // Raw URL input field
      isPublished: [false],
      categoryIds: [[]],
      tagIds: this.fb.array([]),
      tagInputCtrl: ['']
    });
  }

  get tagIdsArray(): FormArray {
    return this.postForm.get('tagIds') as FormArray;
  }
  
  loadData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!id;
    this.loading = true;

    forkJoin({
      categories: this.categoryService.getCategories(),
      tags: this.tagService.getTags(),
      post: this.isEditing ? this.postService.getPost(+id) : of(null)
    }).subscribe(
      result => {
        this.categories = result.categories || [];
        this.tags = result.tags || [];
        this.popularTags = this.tags.slice(0, 5);
        this.tagsLoaded.next(true);
        
        if (this.isEditing && result.post) {
          this.post = result.post;
          this.postId = +id;
          this.postForm.patchValue({
            title: this.post.title,
            content: this.post.content,
            slug: this.post.slug,
            excerpt: this.post.excerpt || '',
            featuredImage: this.post.featuredImage || '',
            videoEmbedCode: this.post.videoEmbedCode || '',
            videoUrl: this.extractYouTubeUrlFromEmbed(this.post.videoEmbedCode || ''),
            isPublished: this.post.isPublished,
            categoryIds: this.post.categories?.map(c => c.id) || []
          });
          this.tagIdsArray.clear();
          this.post.tags?.forEach(tag => this.tagIdsArray.push(this.fb.control(tag.id)));
        }
        this.loading = false;
      },
      error => {
        console.error('Error loading data:', error);
        this.snackBar.open('Error loading data', 'Close', { duration: 3000 });
        this.tagsLoaded.next(true);
        if (this.isEditing) this.router.navigate(['/admin/posts']);
        this.loading = false;
      }
    );
  }
  
  onDelete(): void {
    if (!this.isEditing || !this.post) {
      return;
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
    if (!this.isEditing || !this.post) {
      return;
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
        const newPostData = {
          ...this.postForm.value,
          title: `${this.post.title} (Copy)`,
          isPublished: false,
          slug: ''
        };
        newPostData.tagIds = this.tagIdsArray.value;

        this.submitting = true;
        this.postService.createPost(newPostData).subscribe(
          (createdPost) => {
            this.snackBar.open('Post duplicated successfully', 'Close', { duration: 3000 });
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

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }
    
    // Auto-generate slug if field left empty
    if (!this.postForm.get('slug').value) {
      this.generateSlug();
    }
    
    this.submitting = true;
    const postData = {
      ...this.postForm.value,
      tagIds: this.tagIdsArray.value
    };
    
    // Remove videoUrl as it's only for UI
    delete postData.videoUrl;
    
    // Ensure all string fields are strings, not null
    postData.excerpt = postData.excerpt || '';
    postData.featuredImage = postData.featuredImage || '';
    postData.videoEmbedCode = postData.videoEmbedCode || '';
    
    // Ensure slug is never empty (required field)
    if (!postData.slug || postData.slug.trim() === '') {
      const title = postData.title || 'untitled';
      let slug = title.toLowerCase().replace(/\s+/g, '-');
      slug = slug.replace(/[^a-z0-9-]/g, '');
      slug = slug.replace(/-+/g, '-');
      slug = slug.replace(/^-+|-+$/g, '');
      postData.slug = slug || 'untitled-post';
    }
    
    const saveOperation = this.isEditing 
      ? this.postService.updatePost(this.postId, postData)
      : this.postService.createPost(postData);

    saveOperation.subscribe(
      () => {
        const message = this.isEditing ? 'Post updated successfully' : 'Post created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.submitting = false;
        this.router.navigate(['/admin/posts']);
      },
      error => {
        console.error(`Error ${this.isEditing ? 'updating' : 'creating'} post:`, error);
        this.snackBar.open(`Error ${this.isEditing ? 'updating' : 'creating'} post`, 'Close', { duration: 3000 });
        this.submitting = false;
      }
    );
  }

  onSaveDraft(): void {
    this.postForm.patchValue({ isPublished: false });
    this.onSubmit();
  }

  onPublish(): void {
    this.postForm.patchValue({ isPublished: true });
    this.onSubmit();
  }

  isFullscreen = false;
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    const postEditContainer = this.elementRef.nativeElement.closest('.post-edit-container');
    if (postEditContainer) {
      if (this.isFullscreen) {
        postEditContainer.classList.add('fullscreen');
      } else {
        postEditContainer.classList.remove('fullscreen');
      }
    }
  }

  compareIds(id1: number, id2: number): boolean {
    return id1 === id2;
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      let existingTag = (this.tags || []).find(t => t.name.toLowerCase() === value.toLowerCase());
      if (existingTag) {
        if (!this.tagIdsArray.value.includes(existingTag.id)) {
          this.tagIdsArray.push(this.fb.control(existingTag.id));
        }
      } else {
        this.snackBar.open(`Tag "${value}" not found. Create it first?`, 'Close', { duration: 3000});
      }
    }

    if (event.chipInput) {
      event.chipInput!.clear();
    }
    this.postForm.get('tagInputCtrl').setValue(null);
  }

  removeTag(tagId: number): void {
    const index = this.tagIdsArray.value.indexOf(tagId);
    if (index >= 0) {
      this.tagIdsArray.removeAt(index);
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    const selectedTag: Tag = event.option.value;
    if (selectedTag && !this.tagIdsArray.value.includes(selectedTag.id)) {
      this.tagIdsArray.push(this.fb.control(selectedTag.id));
    }
    if (this.tagInput && this.tagInput.nativeElement) {
        this.tagInput.nativeElement.value = '';
    }
    this.postForm.get('tagInputCtrl').setValue(null);
  }

  getTagNameById(tagId: number): string {
    const tag = (this.tags || []).find(t => t.id === tagId);
    return tag ? tag.name : '' ;
  }

  addPopularTag(tag: Tag): void {
    if (tag && !this.tagIdsArray.value.includes(tag.id)) {
      this.tagIdsArray.push(this.fb.control(tag.id));
    }
  }

  private _filterTags(value: string): Tag[] {
    if (!this.tags) {
      return [];
    }
    const filterValue = value.toLowerCase();
    return this.tags.filter(tag => tag.name.toLowerCase().includes(filterValue));
  }

  getCategoryName(catId: number): string {
    const category = (this.categories || []).find(c => c.id === catId);
    return category ? category.name : '';
  }
  
  getTagName(tagId: number): string {
    return this.getTagNameById(tagId);
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (categories) => {
        this.categories = categories || [];
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
    
    dialogRef.afterClosed().subscribe(newCategory => {
      if (newCategory) {
        this.categories.push(newCategory);
        const currentCategoryIds = this.postForm.get('categoryIds').value || [];
        this.postForm.patchValue({
          categoryIds: [...currentCategoryIds, newCategory.id]
        });
      }
    });
  }
    
  onPreview(): void {
    this.previewMode = !this.previewMode;
  }
    
  generateSlug(): void {
    const title = this.postForm.get('title').value;
    if (title) {
      let slug = title.toLowerCase().replace(/\s+/g, '-');
      slug = slug.replace(/[^a-z0-9-]/g, '');
      slug = slug.replace(/-+/g, '-');
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
    if (this.mediaSelector) {
        this.mediaSelector.open();
    }
  }

  // Video embedding methods
  convertYouTubeUrl(url: string): string {
    if (!url || !url.trim()) return '';
    
    const trimmedUrl = url.trim();
    
    // If it's already an iframe embed code, return as-is
    if (trimmedUrl.includes('<iframe') && trimmedUrl.includes('youtube.com/embed')) {
      return trimmedUrl;
    }
    
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/
    ];
    
    let videoId = null;
    for (const pattern of patterns) {
      const match = trimmedUrl.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }
    
    if (videoId) {
      // Enhanced YouTube embed URL with HD quality parameters
      const embedUrl = `https://www.youtube.com/embed/${videoId}?hd=1&vq=hd1080&quality=hd1080&rel=0&modestbranding=1&iv_load_policy=3`;
      return `<iframe width="1920" height="1080" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    }
    
    // If it's not a YouTube URL but looks like HTML, return as-is (custom embed code)
    if (trimmedUrl.includes('<') && trimmedUrl.includes('>')) {
      return trimmedUrl;
    }
    
    return ''; // Return empty if we can't process it
  }

  onVideoUrlChange(url: string): void {
    // Update the raw URL field
    this.postForm.patchValue({ videoUrl: url }, { emitEvent: false });
    
    // Convert to embed code
    const embedCode = this.convertYouTubeUrl(url);
    this.postForm.patchValue({ videoEmbedCode: embedCode }, { emitEvent: false });
    
    // Clear featured image when video is set
    if (embedCode.trim()) {
      this.postForm.patchValue({ featuredImage: '' }, { emitEvent: false });
    }
  }

  onSelectFeaturedImage(imageUrl: string): void {
    this.postForm.patchValue({ featuredImage: imageUrl });
    
    // Clear video when image is set
    if (imageUrl) {
      this.postForm.patchValue({ videoEmbedCode: '' });
    }
  }

  removeImage(): void {
    this.postForm.patchValue({ featuredImage: '' });
  }

  removeVideo(): void {
    this.postForm.patchValue({ 
      videoEmbedCode: '',
      videoUrl: ''
    });
  }

  hasMediaContent(): boolean {
    return !!(this.postForm.get('featuredImage')?.value || this.postForm.get('videoEmbedCode')?.value);
  }

  private extractYouTubeUrlFromEmbed(embedCode: string): string {
    if (!embedCode) return '';

    // Extract video ID from YouTube embed code
    const embedRegex = /src="https?:\/\/www\.youtube\.com\/embed\/([^"?]+)/;
    const match = embedCode.match(embedRegex);

    if (match && match[1]) {
      const videoId = match[1];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    return embedCode; // Return original if not a YouTube embed
  }
}