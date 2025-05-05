import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string[];
  color: string;
}

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatTooltipModule
  ]
})
export class QuickActionsComponent {
  actions: QuickAction[] = [
    {
      title: 'Create Post',
      description: 'Write a new blog post',
      icon: 'post_add',
      route: ['/admin/posts/new'],
      color: 'primary'
    },
    {
      title: 'Create Page',
      description: 'Add a new page',
      icon: 'note_add',
      route: ['/admin/pages/new'],
      color: 'accent'
    },
    {
      title: 'Upload Media',
      description: 'Add images or files',
      icon: 'add_photo_alternate',
      route: ['/admin/media'],
      color: 'warn'
    },
    {
      title: 'Manage Comments',
      description: 'Review pending comments',
      icon: 'comment',
      route: ['/admin/comments'],
      color: 'primary'
    },
    {
      title: 'Add Category',
      description: 'Create a new category',
      icon: 'category',
      route: ['/admin/categories'],
      color: 'accent'
    },
    {
      title: 'Add User',
      description: 'Create a new user',
      icon: 'person_add',
      route: ['/admin/users/new'],
      color: 'warn'
    }
  ];
  
  getIconBackground(color: string): string {
    switch (color) {
      case 'primary':
        return '#3f51b5';
      case 'accent':
        return '#ff4081';
      case 'warn':
        return '#f44336';
      default:
        return '#3f51b5';
    }
  }
}