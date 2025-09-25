import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  isLoading = true;
  searchTerm: string = '';

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.customers.filter(customer =>
      customer.fullName.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.phone.toLowerCase().includes(term)
    );
  }

  deleteCustomer(id: string) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        alert('Customer deleted successfully!');
        this.loadCustomers();
      },
      error: (err) => {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer. Please try again.');
      }
    });
  }
}
