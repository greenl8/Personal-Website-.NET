import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private router: Router,
    private location: Location
  ) {}

  goToHome(): Promise<boolean> {
    return this.router.navigate(['/']);
  }

  goToLogin(returnUrl?: string): Promise<boolean> {
    return this.router.navigate(['/login'], {
      queryParams: returnUrl ? { returnUrl } : {}
    });
  }

  goToBlog(): Promise<boolean> {
    return this.router.navigate(['/blog']);
  }

  goToPost(slug: string): Promise<boolean> {
    return this.router.navigate(['/post', slug]);
  }

  goToPage(slug: string): Promise<boolean> {
    return this.router.navigate(['/page', slug]);
  }

  goToAdminDashboard(): Promise<boolean> {
    return this.router.navigate(['/admin']);
  }

  goToAdminPosts(): Promise<boolean> {
    return this.router.navigate(['/admin/posts']);
  }

  goToAdminPages(): Promise<boolean> {
    return this.router.navigate(['/admin/pages']);
  }

  goToAdminCategories(): Promise<boolean> {
    return this.router.navigate(['/admin/categories']);
  }

  goToAdminTags(): Promise<boolean> {
    return this.router.navigate(['/admin/tags']);
  }

  goToAdminMedia(): Promise<boolean> {
    return this.router.navigate(['/admin/media']);
  }

  goToError(errorType: '403' | '404' | '500'): Promise<boolean> {
    const errorRoutes = {
      '403': '/error/403',
      '404': '/error/404', 
      '500': '/error/500'
    };
    
    return this.router.navigate([errorRoutes[errorType]], {
      state: { errorType }
    });
  }

  goBack(): void {
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }

  getCurrentPath(): string {
    return this.location.path();
  }
}