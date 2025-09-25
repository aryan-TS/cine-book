import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


interface Screen {
  screenNumber: number;
  capacity: number;
}

interface Theatre {
  _id?: string;
  name: string;
  location: string;
  screens: Screen[];
}

@Component({
  selector: 'app-theatres',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './theatres.component.html',
  styleUrl: './theatres.component.scss'
})
export class TheatresComponent implements OnInit {
  theatres: Theatre[] = [];
  isEditing: boolean = false;
  editId: string | null = null;

  // Form fields
  name: string = '';
  location: string = '';
  screens: Screen[] = [{ screenNumber: 1, capacity: 100 }];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTheatres();
  }

  loadTheatres() {
    this.http.get<Theatre[]>('http://localhost:5000/api/theatres').subscribe({
      next: (res) => (this.theatres = res),
      error: (err) => console.error('Error loading theatres:', err),
    });
  }

  addScreen() {
    this.screens.push({ screenNumber: this.screens.length + 1, capacity: 100 });
  }

  removeScreen(index: number) {
    if (this.screens.length > 1) {
      this.screens.splice(index, 1);
    }
  }

  addOrUpdateTheatre() {
    const theatre: Theatre = {
      name: this.name,
      location: this.location,
      screens: this.screens,
    };

    if (this.isEditing && this.editId) {
      // Update
      this.http.put(`http://localhost:5000/api/theatres/${this.editId}`, theatre).subscribe({
        next: () => {
          this.loadTheatres();
          this.resetForm();
        },
        error: (err) => console.error('Error updating theatre:', err),
      });
    } else {
      // Add new
      this.http.post('http://localhost:5000/api/theatres', theatre).subscribe({
        next: () => {
          this.loadTheatres();
          this.resetForm();
        },
        error: (err) => console.error('Error adding theatre:', err),
      });
    }
  }

  editTheatre(theatre: Theatre) {
    this.isEditing = true;
    this.editId = theatre._id || null;
    this.name = theatre.name;
    this.location = theatre.location;
    this.screens = JSON.parse(JSON.stringify(theatre.screens)); // clone
  }

  deleteTheatre(id?: string) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this theatre?')) {
      this.http.delete(`http://localhost:5000/api/theatres/${id}`).subscribe({
        next: () => this.loadTheatres(),
        error: (err) => console.error('Error deleting theatre:', err),
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.editId = null;
    this.name = '';
    this.location = '';
    this.screens = [{ screenNumber: 1, capacity: 100 }];
  }
}