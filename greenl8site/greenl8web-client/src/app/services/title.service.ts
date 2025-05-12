import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly baseTitle = 'Greenl8 Portfolio';

  constructor(
    private title: Title,
    private meta: Meta,
    private router: Router
  ) {
    this.handleRouteEvents();
  }

  private handleRouteEvents(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const url = this.router.url;
      this.setTitleFromUrl(url);
    });
  }

  setTitleFromUrl(url: string): void {
    let pageTitle = this.baseTitle;
    
    if (url === '/') {
      pageTitle = `Home | ${this.baseTitle}`;
    } else if (url.startsWith('/admin')) {
      pageTitle = `Admin Dashboard | ${this.baseTitle}`;
    } else if (url.startsWith('/blog')) {
      pageTitle = `Blog | ${this.baseTitle}`;
    }
    
    this.setTitle(pageTitle);
  }

  setTitle(title: string): void {
    this.title.setTitle(title);
  }

  setMetaTags(config: {
    title?: string,
    description?: string,
    image?: string,
    type?: string
  }): void {
    if (config.title) {
      this.meta.updateTag({ property: 'og:title', content: config.title });
      this.meta.updateTag({ name: 'twitter:title', content: config.title });
    }
    
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }
    
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }
    
    if (config.type) {
      this.meta.updateTag({ property: 'og:type', content: config.type });
    }
  }
}