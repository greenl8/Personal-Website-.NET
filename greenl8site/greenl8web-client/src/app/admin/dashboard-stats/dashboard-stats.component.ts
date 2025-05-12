import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { DashboardSummary } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-stats',
  template: `
    <div class="stats-grid">
      <mat-card *ngFor="let stat of stats" class="stat-card" matRipple>
        <div class="stat-icon" [ngClass]="stat.iconClass">
          <mat-icon>{{stat.icon}}</mat-icon>
        </div>
        <div class="stat-details">
          <div class="stat-value">{{stat.value}}</div>
          <div class="stat-label">{{stat.label}}</div>
          <div class="stat-secondary">{{stat.secondary}}</div>
        </div>
      </mat-card>
    </div>
  `,
  styleUrls: ['./dashboard-stats.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatRippleModule]
})
export class DashboardStatsComponent {
  @Input() set summary(value: DashboardSummary) {
    if (value) {
      this.updateStats(value);
    }
  }

  stats: any[] = [];

  private updateStats(summary: DashboardSummary): void {
    this.stats = [
      {
        icon: 'article',
        iconClass: 'posts-icon',
        value: summary.postCount,
        label: 'Posts',
        secondary: `${summary.draftCount} drafts`
      },
      {
        icon: 'comment',
        iconClass: 'comments-icon',
        value: summary.commentCount,
        label: 'Comments',
        secondary: `${summary.pendingCommentCount} pending`
      },
      {
        icon: 'group',
        iconClass: 'users-icon',
        value: summary.userCount,
        label: 'Users',
        secondary: `${summary.newUserCount} new`
      },
      {
        icon: 'visibility',
        iconClass: 'views-icon',
        value: summary.viewCount,
        label: 'Views',
        secondary: 'Today'
      }
    ];
  }
}
