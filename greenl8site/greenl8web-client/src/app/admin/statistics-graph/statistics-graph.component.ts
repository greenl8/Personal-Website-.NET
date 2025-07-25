import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

interface StatisticData {
  views: number;
  visitors: number;
  likes: number;
  comments: number;
  date: string;
}

interface MetricStats {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down';
}

@Component({
  selector: 'app-statistics-graph',
  templateUrl: './statistics-graph.component.html',
  styleUrls: ['./statistics-graph.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    BaseChartDirective
  ]
})
export class StatisticsGraphComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  // Form controls
  intervalControl = new FormControl('days');
  startDateControl = new FormControl(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  endDateControl = new FormControl(new Date());
  
  // Chart configuration
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: '#e0e0e0'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };
  
  // Interval options
  intervals = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' }
  ];
  
  // Statistics
  viewsStats: MetricStats = { current: 0, previous: 0, change: 0, trend: 'up' };
  visitorsStats: MetricStats = { current: 0, previous: 0, change: 0, trend: 'up' };
  likesStats: MetricStats = { current: 0, previous: 0, change: 0, trend: 'up' };
  commentsStats: MetricStats = { current: 0, previous: 0, change: 0, trend: 'up' };
  
  // Current data
  currentData: StatisticData[] = [];
  noDataAvailable = false;
  loading = false;
  error = false;
  
  private subscriptions = new Subscription();

  constructor(private http: HttpClient) {
    Chart.register(...registerables);
  }
  
  ngOnInit(): void {
    // Initialize with empty chart data
    this.updateChart();
    
    this.loadStatistics();
    
    // Listen for control changes
    this.subscriptions.add(
      this.intervalControl.valueChanges.subscribe(() => {
        this.loadStatistics();
      })
    );
    
    this.subscriptions.add(
      this.startDateControl.valueChanges.subscribe(() => {
        this.loadStatistics();
      })
    );
    
    this.subscriptions.add(
      this.endDateControl.valueChanges.subscribe(() => {
        this.loadStatistics();
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  /**
   * Load statistics data from the backend
   */
  loadStatistics(): void {
    this.loading = true;
    this.error = false;
    
    const startDate = this.startDateControl.value || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = this.endDateControl.value || new Date();
    const interval = this.intervalControl.value || 'days';
    
    const params = new URLSearchParams({
      interval: interval,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
    
    this.http.get<StatisticData[]>(`${environment.apiUrl}dashboard/statistics?${params.toString()}`)
      .subscribe({
        next: (data) => {
          this.currentData = data;
          this.noDataAvailable = data.length === 0;
          this.updateChart();
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
          this.error = true;
          this.loading = false;
        }
      });
  }
  
  /**
   * Format date based on selected interval
   */
  formatDateForInterval(date: Date, interval: string): string {
    switch (interval) {
      case 'days':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weeks':
        return `Week ${this.getWeekNumber(date)}`;
      case 'months':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'years':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  }
  
  /**
   * Get week number of the year
   */
  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  
  /**
   * Update chart data
   */
  updateChart(): void {
    const labels = this.currentData.map(d => d.date);
    
    this.lineChartData = {
      labels,
      datasets: [
        {
          data: this.currentData.map(d => d.views),
          label: 'Views',
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3f51b5',
          pointBorderColor: '#3f51b5',
          pointHoverBackgroundColor: '#3f51b5',
          pointHoverBorderColor: '#3f51b5'
        },
        {
          data: this.currentData.map(d => d.visitors),
          label: 'Visitors',
          borderColor: '#00bcd4',
          backgroundColor: 'rgba(0, 188, 212, 0.1)',
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#00bcd4',
          pointBorderColor: '#00bcd4',
          pointHoverBackgroundColor: '#00bcd4',
          pointHoverBorderColor: '#00bcd4'
        }
      ]
    };
    
    if (this.chart) {
      this.chart.update();
    }
  }
  
  /**
   * Calculate statistics and trends
   */
  calculateStats(): void {
    if (this.currentData.length === 0) return;
    
    const currentPeriod = this.currentData.slice(-Math.ceil(this.currentData.length / 2));
    const previousPeriod = this.currentData.slice(0, Math.floor(this.currentData.length / 2));
    
    this.viewsStats = this.calculateMetricStats(
      currentPeriod.reduce((sum, d) => sum + d.views, 0),
      previousPeriod.reduce((sum, d) => sum + d.views, 0)
    );
    
    this.visitorsStats = this.calculateMetricStats(
      currentPeriod.reduce((sum, d) => sum + d.visitors, 0),
      previousPeriod.reduce((sum, d) => sum + d.visitors, 0)
    );
    
    this.likesStats = this.calculateMetricStats(
      currentPeriod.reduce((sum, d) => sum + d.likes, 0),
      previousPeriod.reduce((sum, d) => sum + d.likes, 0)
    );
    
    this.commentsStats = this.calculateMetricStats(
      currentPeriod.reduce((sum, d) => sum + d.comments, 0),
      previousPeriod.reduce((sum, d) => sum + d.comments, 0)
    );
  }
  
  /**
   * Calculate metric statistics
   */
  calculateMetricStats(current: number, previous: number): MetricStats {
    let change = 0;
    if (previous > 0) {
      change = Math.round(((current - previous) / previous) * 100);
    } else if (current > 0) {
      change = 100;
    }
    
    return {
      current,
      previous,
      change: Math.abs(change),
      trend: current >= previous ? 'up' : 'down'
    };
  }
  
  /**
   * Get formatted date range
   */
  getDateRangeLabel(): string {
    const start = this.startDateControl.value;
    const end = this.endDateControl.value;
    
    if (!start || !end) return '';
    
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  }
  
  /**
   * Set predefined date ranges
   */
  setDateRange(days: number): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    this.startDateControl.setValue(startDate);
    this.endDateControl.setValue(endDate);
  }
  
  /**
   * Retry loading data
   */
  retry(): void {
    this.loadStatistics();
  }
} 