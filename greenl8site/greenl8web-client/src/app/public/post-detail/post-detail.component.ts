import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
  post: Post;
  relatedPosts: Post[] = [];
  loading = true;
  error = false;
  slug: string;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private snackBar: MatSnackBar,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug');
    this.loadPost();
  }

  loadPost(): void {
    this.loading = true;
    
    this.postService.getPostBySlug(this.slug).subscribe(
      post => {
        // Check if post is published
        if (!post.isPublished) {
          this.router.navigate(['/']);
          return;
        }
        
        this.post = post;
        this.updateMetadata();
        this.loading = false;
        
        // Load related posts
        this.loadRelatedPosts();
      },
      error => {
        console.error('Error loading post:', error);
        this.loading = false;
        this.error = true;
        
        // Show error message
        this.snackBar.open('Post not found or unavailable', 'Close', {
          duration: 5000
        });
      }
    );
  }

  loadRelatedPosts(): void {
    // If post has categories, load related posts from the same category
    if (this.post.categories && this.post.categories.length > 0) {
      const categoryId = this.post.categories[0].id;
      
      this.postService.getPosts({
        page: 1,
        pageSize: 3,
        isPublished: true,
        categoryId: categoryId
      }).subscribe(
        result => {
          // Filter out the current post from related posts
          this.relatedPosts = result.items
            .filter(p => p.id !== this.post.id)
            .map(p => ({
              ...p,
              excerpt: '',
              content: '',
              author: null,
              categories: [],
              tags: []
            }));
        }
      );
    }
  }

  updateMetadata(): void {
    // Update page title
    this.titleService.setTitle(this.post.title);
    
    // Update meta tags
    this.metaService.updateTag({ name: 'description', content: this.post.excerpt || this.stripHtml(this.post.content).substring(0, 160) });
    
    // Open Graph meta tags for social sharing
    this.metaService.updateTag({ property: 'og:title', content: this.post.title });
    this.metaService.updateTag({ property: 'og:description', content: this.post.excerpt || this.stripHtml(this.post.content).substring(0, 160) });
    this.metaService.updateTag({ property: 'og:url', content: window.location.href });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    
    if (this.post.featuredImage) {
      this.metaService.updateTag({ property: 'og:image', content: this.post.featuredImage });
    }
  }

  stripHtml(html: string): string {
    // Create a temporary div element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Return the div's text content (without HTML tags)
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  goBack(): void {
    this.location.back();
  }

  shareOnFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  shareOnTwitter(): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.post.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  }
}