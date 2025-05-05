import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: './dashboard-chart.component.html',
  styleUrls: ['./dashboard-chart.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ]
})
export class DashboardChartComponent implements OnChanges, AfterViewInit {
  @Input() chartData: any[] = [];
  @Input() period: string = '30d';
  
  // Chart display properties
  chartLabels: string[] = [];
  chartValues: number[] = [];
  maxValue: number = 0;
  
  // Canvas context for drawing
  private ctx: CanvasRenderingContext2D | null = null;
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] || changes['period']) {
      this.prepareChartData();
      // If already rendered, redraw
      if (this.ctx) {
        this.drawChart();
      }
    }
  }
  
  ngAfterViewInit(): void {
    // Initialize chart after view is ready
    setTimeout(() => this.initChart(), 0);
  }
  
  /**
   * Initialize the chart
   */
  initChart(): void {
    const canvas = this.elementRef.nativeElement.querySelector('#trafficChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    
    this.drawChart();
  }
  
  /**
   * Process the input chart data for display
   */
  prepareChartData(): void {
    if (!this.chartData || this.chartData.length === 0) {
      this.chartLabels = [];
      this.chartValues = [];
      return;
    }
    
    // Extract labels and values from chart data
    this.chartLabels = this.chartData.map(item => item.label);
    this.chartValues = this.chartData.map(item => item.value);
    
    // Calculate max value for scaling
    this.maxValue = Math.max(...this.chartValues) * 1.1; // Add 10% padding
  }
  
  /**
   * Draw the chart on the canvas
   */
  drawChart(): void {
    const canvas = this.elementRef.nativeElement.querySelector('#trafficChart') as HTMLCanvasElement;
    if (!canvas || !this.ctx) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // If no data, show empty state
    if (this.chartValues.length === 0) {
      this.drawEmptyState(canvas);
      return;
    }
    
    // Chart dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Draw axes
    this.drawAxes(padding, chartWidth, chartHeight);
    
    // Draw data
    this.drawData(padding, chartWidth, chartHeight);
    
    // Draw labels
    this.drawLabels(padding, chartWidth, chartHeight);
  }
  
  /**
   * Draw chart axes
   */
  private drawAxes(padding: number, chartWidth: number, chartHeight: number): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1;
    
    // Y-axis
    this.ctx.moveTo(padding, padding);
    this.ctx.lineTo(padding, padding + chartHeight);
    
    // X-axis
    this.ctx.moveTo(padding, padding + chartHeight);
    this.ctx.lineTo(padding + chartWidth, padding + chartHeight);
    
    this.ctx.stroke();
  }
  
  /**
   * Draw chart data points and line
   */
  private drawData(padding: number, chartWidth: number, chartHeight: number): void {
    if (!this.ctx || this.chartValues.length === 0) return;
    
    // Calculate point spacing
    const pointSpacing = chartWidth / (this.chartValues.length - 1 || 1);
    
    // Draw connecting line
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#3f51b5';
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(
      padding,
      padding + chartHeight - (chartHeight * this.chartValues[0] / this.maxValue)
    );
    
    // Draw line connecting points
    for (let i = 1; i < this.chartValues.length; i++) {
      const x = padding + (pointSpacing * i);
      const y = padding + chartHeight - (chartHeight * this.chartValues[i] / this.maxValue);
      this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    
    // Draw area fill
    this.ctx.lineTo(padding + chartWidth, padding + chartHeight);
    this.ctx.lineTo(padding, padding + chartHeight);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(63, 81, 181, 0.1)';
    this.ctx.fill();
    
    // Draw points
    for (let i = 0; i < this.chartValues.length; i++) {
      const x = padding + (pointSpacing * i);
      const y = padding + chartHeight - (chartHeight * this.chartValues[i] / this.maxValue);
      
      // Draw point
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = '#3f51b5';
      this.ctx.fill();
      
      // Draw outer circle
      this.ctx.beginPath();
      this.ctx.arc(x, y, 6, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#3f51b5';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw x-axis labels
   */
  private drawLabels(padding: number, chartWidth: number, chartHeight: number): void {
    if (!this.ctx || this.chartLabels.length === 0) return;
    
    // Calculate label spacing
    const labelSpacing = chartWidth / (this.chartLabels.length - 1 || 1);
    
    // Draw X-axis labels
    this.ctx.font = '12px Arial';
    this.ctx.fillStyle = '#666';
    this.ctx.textAlign = 'center';
    
    for (let i = 0; i < this.chartLabels.length; i++) {
      // Only show some labels if there are too many
      if (this.chartLabels.length > 14 && i % 2 !== 0 && i !== this.chartLabels.length - 1) {
        continue;
      }
      
      const x = padding + (labelSpacing * i);
      const y = padding + chartHeight + 20;
      this.ctx.fillText(this.chartLabels[i], x, y);
    }
    
    // Draw Y-axis labels (3 of them)
    this.ctx.textAlign = 'right';
    for (let i = 0; i <= 2; i++) {
      const value = Math.round(this.maxValue * (i / 2));
      const x = padding - 10;
      const y = padding + chartHeight - (chartHeight * (i / 2)) + 4;
      this.ctx.fillText(value.toString(), x, y);
    }
  }
  
  /**
   * Draw empty state when no data is available
   */
  private drawEmptyState(canvas: HTMLCanvasElement): void {
    if (!this.ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillStyle = '#999';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('No data available', centerX, centerY - 10);
    
    this.ctx.font = '14px Arial';
    this.ctx.fillText('Select a different time period or check back later', centerX, centerY + 20);
  }
  
  /**
   * Calculate the trend percentage change
   */
  calculateTrend(): number {
    if (!this.chartValues || this.chartValues.length < 2) {
      return 0;
    }
    
    // Calculate percentage change between first and last value
    const firstValue = this.chartValues[0];
    const lastValue = this.chartValues[this.chartValues.length - 1];
    
    if (firstValue === 0) {
      return lastValue > 0 ? 100 : 0;
    }
    
    const change = ((lastValue - firstValue) / firstValue) * 100;
    return Math.round(change);
  }
  
  /**
   * Check if the trend is upward
   */
  isTrendingUp(): boolean {
    if (!this.chartValues || this.chartValues.length < 2) {
      return true;
    }
    
    const firstValue = this.chartValues[0];
    const lastValue = this.chartValues[this.chartValues.length - 1];
    
    return lastValue >= firstValue;
  }

}