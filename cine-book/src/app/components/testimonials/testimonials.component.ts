import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
})
export class TestimonialsComponent {
  testimonials = [
    {
      name: 'John Doe',
      message:
        'Amazing experience! Easy booking and great seat selection. CineBook made my movie night perfect!',
    },
    {
      name: 'Jane Smith',
      message: 'Loved the UI and the ease of use. Highly recommend CineBook!',
    },
    {
      name: 'Alice Johnson',
      message: 'Quick, reliable, and simple. Will definitely use again!',
    },
  ];

  currentIndex = 0;

  get currentTestimonial() {
    return this.testimonials[this.currentIndex];
  }

  previousTestimonial() {
    this.currentIndex =
      (this.currentIndex - 1 + this.testimonials.length) %
      this.testimonials.length;
  }

  nextTestimonial() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
}
