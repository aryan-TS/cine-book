import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartData } from 'chart.js';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  // Bar chart
  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  // Pie chart
  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.bookingService.getBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.prepareBarChart(bookings);
        this.preparePieChart(bookings);
      },
      error: (err) => console.error('Error fetching bookings:', err)
    });
  }

  private prepareBarChart(bookings: Booking[]) {
    // Count tickets per movie
    const movieMap = new Map<string, number>();
    bookings.forEach(b => {
      const count = b.seats?.length || 0;
      movieMap.set(b.movieTitle, (movieMap.get(b.movieTitle) || 0) + count);
    });

    this.barChartData = {
      labels: Array.from(movieMap.keys()),
      datasets: [{ label: 'Tickets Sold', data: Array.from(movieMap.values()) }]
    };
  }

  private preparePieChart(bookings: Booking[]) {
  // Calculate revenue per movie
  const revenueMap = new Map<string, number>();
  bookings.forEach(b => {
    revenueMap.set(
      b.movieTitle,
      (revenueMap.get(b.movieTitle) || 0) + (b.totalAmount || 0)
    );
  });

  this.pieChartData = {
    labels: Array.from(revenueMap.keys()),
    datasets: [{ data: Array.from(revenueMap.values()) }]
  };
}

}
