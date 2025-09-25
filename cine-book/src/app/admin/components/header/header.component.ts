import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar class="header">
      <!-- Mobile menu button -->
      <button mat-icon-button class="d-md-none" (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="title">Dashboard Overview</span>
      <span class="spacer"></span>
    </mat-toolbar>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
}
