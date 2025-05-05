import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

// Material Imports
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { PageService } from '../../services/page.service';
import { MediaService } from '../../services/media.service';
//import { CommentService } from '../../services/comment.service';

// Charts component
//import { NgChartsModule } from 'ng2-charts';
import { DashboardChartComponent } from '../dashboard-chart/dashboard-chart.component';
import { RecentActivityComponent } from '../recent-activity/recent-activity.component';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';

// Models and interfaces
import { User } from '../../models/user.model';
import { DashboardSummary, RecentActivity, SystemStatus } from '../../models/dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatRippleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    //NgChartsModule,
    DashboardChartComponent,
    RecentActivityComponent,
    QuickActionsComponent
  ]
})
export class AdminDashboardComponent implements OnInit {
  // Properties
  currentUser: User;
  dashboardSummary: DashboardSummary;
  recentActivities: RecentActivity[] = [];
  systemStatus: SystemStatus;
  
  // UI state
  sidenavOpen = true;
  loading = true;
  error = false;
  dateFormat = 'MMM dd, yyyy';
  
  // Time periods for charts
  timePeriods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];
  
  selectedTimePeriod = '30d';

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private pageService: PageService,
    private mediaService: MediaService,
    //private commentService: CommentService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardData();
  }
  
  /**
   * Loads the currently logged-in user
   */
  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe(
      user => {
        this.currentUser = user;
      },
      error => {
        console.error('Error loading user:', error);
      }
    );
  }
  
  /**
   * Loads all dashboard data using parallel requests
   */
  loadDashboardData(): void {
    this.loading = true;
    
    forkJoin({
      summary: this.getDashboardSummary(),
      activities: this.getRecentActivities(),
      systemStatus: this.getSystemStatus()
    }).subscribe(
      results => {
        this.dashboardSummary = results.summary;
        this.recentActivities = results.activities;
        this.systemStatus = results.systemStatus;
        this.loading = false;
      },
      error => {
        console.error('Error loading dashboard data:', error);
        this.error = true;
        this.loading = false;
      }
    );
  }
  
  /**
   * Fetches summary statistics for the dashboard
   */
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>('api/dashboard/summary');
  }
  
  /**
   * Fetches recent activities for the activity feed
   */
  getRecentActivities(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>('api/dashboard/activities');
  }
  
  /**
   * Fetches system status information
   */
  getSystemStatus(): Observable<SystemStatus> {
    return this.http.get<SystemStatus>('api/dashboard/status');
  }
  
  /**
   * Changes the time period for analytics data
   */
  onTimePeriodChange(period: string): void {
    this.selectedTimePeriod = period;
    // Reload chart data or update the existing data
  }
  
  /**
   * Toggles sidebar visibility
   */
  toggleSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
  }
  
  /**
   * Refreshes all dashboard data
   */
  refreshData(): void {
    this.loadDashboardData();
  }
  
  /**
   * Returns the appropriate CSS class based on system status
   */
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'good':
        return 'status-good';
      case 'warning':
        return 'status-warning';
      case 'critical':
        return 'status-critical';
      default:
        return '';
    }
  }
  
  /**
   * Returns the latest draft posts (up to 5)
   */
  get latestDrafts(): any[] {
    return this.dashboardSummary?.recentDrafts || [];
  }
  
  /**
   * Returns the latest comments (up to 5)
   */
  get latestComments(): any[] {
    return this.dashboardSummary?.recentComments || [];
  }
  
  /**
   * Returns label for current statistics period
   */
  get currentPeriodLabel(): string {
    return this.timePeriods.find(p => p.value === this.selectedTimePeriod)?.label || 'Custom Period';
  }
  
  /**
   * Formats large numbers with K/M/B suffixes
   */
  formatNumber(num: number): string {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  currentDate = new Date();
}