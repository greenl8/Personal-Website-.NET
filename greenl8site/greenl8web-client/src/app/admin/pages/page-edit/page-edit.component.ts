import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageService } from '../../../services/page.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCard, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-page-edit',
  templateUrl: './page-edit.component.html',
  styleUrls: ['./page-edit.component.scss']

    , standalone: true,

    imports: [ MatCard,
        MatCardHeader,
        MatCardTitle]
})
export class PageEditComponent implements OnInit {
  pageForm: FormGroup;
  isEditing = false;
  pageId: number;
  loading = false;
  submitting = false;
  
  constructor(
    private fb: FormBuilder,
    private pageService: PageService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.pageId = +id;
        this.loadPage(this.pageId);
      }
    });
  }
  
  createForm(): void {
    this.pageForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      slug: [''],
      isPublished: [false]
    });
  }
  
  loadPage(id: number): void {
    this.loading = true;
    
    this.pageService.getPage(id).subscribe(
      page => {
        this.pageForm.patchValue({
          title: page.title,
          content: page.content,
          slug: page.slug,
          isPublished: page.isPublished
        });
        
        this.loading = false;
      },
      error => {
        console.error('Error loading page:', error);
        this.snackBar.open('Error loading page', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/pages']);
        this.loading = false;
      }
    );
  }
  
  onSubmit(): void {
    if (this.pageForm.invalid) {
      return;
    }
    
    this.submitting = true;
    const pageData = this.pageForm.value;
    
    if (this.isEditing) {
      this.pageService.updatePage(this.pageId, pageData).subscribe(
        () => {
          this.snackBar.open('Page updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/pages']);
          this.submitting = false;
        },
        error => {
          console.error('Error updating page:', error);
          this.snackBar.open('Error updating page', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      );
    } else {
      this.pageService.createPage(pageData).subscribe(
        () => {
          this.snackBar.open('Page created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/pages']);
          this.submitting = false;
        },
        error => {
          console.error('Error creating page:', error);
          this.snackBar.open('Error creating page', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      );
    }
  }
}