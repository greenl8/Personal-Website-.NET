import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageService } from '../../services/page.service';
import { Page } from '../../models/page.model';

@Component({
  selector: 'app-page-detail',
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.scss']
})
export class PageDetailComponent implements OnInit {
  page: Page;
  loading = true;
  error = false;
  slug: string;

  constructor(
    private pageService: PageService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug');
    this.loadPage();
  }

  loadPage(): void {
    this.loading = true;
    
    this.pageService.getPageBySlug(this.slug).subscribe(
      page => {
        // Check if page is published
        if (!page.isPublished) {
          this.router.navigate(['/']);
          return;
        }
        
        this.page = page;
        this.updateMetadata();
        this.loading = false;
      },
      error => {
        console.error('Error loading page:', error);
        this.loading = false;
        this.error = true;
        
        // Show error message
        this.snackBar.open('Page not found or unavailable', 'Close', {
          duration: 5000
        });
      }
    );
  }

  updateMetadata(): void {
    // Update page title
    this.titleService.setTitle(this.page.title);
    
    // Update meta tags
    this.metaService.updateTag({ 
      name: 'description', 
      content: this.stripHtml(this.page.content).substring(0, 160) 
    });
    
    // Open Graph meta tags for social sharing
    this.metaService.updateTag({ property: 'og:title', content: this.page.title });
    this.metaService.updateTag({ 
      property: 'og:description', 
      content: this.stripHtml(this.page.content).substring(0, 160) 
    });
    this.metaService.updateTag({ property: 'og:url', content: window.location.href });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
  }

  stripHtml(html: string): string {
    // Create a temporary div element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Return the div's text content (without HTML tags)
    return tempDiv.textContent || tempDiv.innerText || '';
  }
}