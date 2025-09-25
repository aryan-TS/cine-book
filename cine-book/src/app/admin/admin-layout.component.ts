import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-container">
      <app-sidebar
        [open]="sidebarOpen"
        (close)="closeSidebar()"
        class="sidebar-component"
      ></app-sidebar>

      <div class="main-content">
        <app-header (toggleSidebar)="toggleSidebar()"></app-header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <div
        class="mobile-overlay"
        *ngIf="isMobile && sidebarOpen"
        (click)="closeSidebar()"
      ></div>
    </div>
  `,
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  isMobile = window.innerWidth < 768;
  sidebarOpen = !this.isMobile;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.sidebarOpen = true;
    } else {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}
