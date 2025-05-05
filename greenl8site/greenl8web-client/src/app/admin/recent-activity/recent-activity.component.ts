import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { RecentActivity } from '../../models/dashboard.model';

@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule
  ]
})
export class RecentActivityComponent {
  @Input() activities: RecentActivity[] = [];
  
  /**
   * Get the appropriate icon for an activity type
   */
  getActivityIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'post_created':
        return 'post_add';
      case 'post_updated':
        return 'edit';
      case 'post_deleted':
        return 'delete';
      case 'comment_added':
        return 'comment';
      case 'comment_approved':
        return 'check_circle';
      case 'comment_rejected':
        return 'cancel';
      case 'user_registered':
        return 'person_add';
      case 'media_uploaded':
        return 'upload_file';
      case 'page_created':
        return 'note_add';
      case 'page_updated':
        return 'edit_note';
      case 'login':
        return 'login';
      default:
        return 'notifications';
    }
  }
  
  /**
   * Get CSS class for activity type
   */
  getActivityClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'post_created':
      case 'page_created':
      case 'comment_approved':
      case 'user_registered':
        return 'activity-success';
      case 'post_deleted':
      case 'comment_rejected':
        return 'activity-danger';
      case 'post_updated':
      case 'page_updated':
      case 'media_uploaded':
        return 'activity-info';
      case 'comment_added':
        return 'activity-warning';
      case 'login':
        return 'activity-secondary';
      default:
        return '';
    }
  }
  
  /**
   * Format the relative time for an activity
   */
  formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    } else {
      return activityDate.toLocaleDateString();
    }
  }
  
  /**
   * Get the appropriate route for an activity
   */
  getActivityRoute(activity: RecentActivity): string[] {
    switch (activity.type.toLowerCase()) {
      case 'post_created':
      case 'post_updated':
        return ['/admin/posts/edit', activity.entityId.toString()];
      case 'page_created':
      case 'page_updated':
        return ['/admin/pages/edit', activity.entityId.toString()];
      case 'comment_added':
      case 'comment_approved':
      case 'comment_rejected':
        return ['/admin/comments', activity.entityId.toString()];
      case 'user_registered':
        return ['/admin/users/edit', activity.entityId.toString()];
      case 'media_uploaded':
        return ['/admin/media'];
      default:
        return ['/admin'];
    }
  }
}