import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { OrdersService } from '../../../services/orders.service';
import { faCheck, faEdit, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-page',
  standalone: false,
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage implements OnInit, OnDestroy {

  faEdit = faEdit;
  faCheck = faCheck;
  faXmark = faXmark;
  orders: any[] = [];
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private ordersService: OrdersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orders = [];

    this.ordersService.getAllOrders()
      .subscribe({
        next: (data) => {
          this.orders = [...(data ?? [])];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'pending':
        return 'text-bg-warning';

      case 'ready':
        return 'text-bg-info';

      case 'completed':
        return 'text-bg-success';

      case 'cancelled':
        return 'text-bg-danger';

      default:
        return 'text-bg-secondary';
    }
  }

  editingOrderId: number | null = null;
  selectedStatus = '';

  statuses = [
    'pending',
    'ready',
    'completed',
    'cancelled'
  ];

  startEdit(order: any) {
    this.editingOrderId = order.id;
    this.selectedStatus = order.status ?? 'pending';
  }

  cancelEdit() {
    this.editingOrderId = null;
    this.selectedStatus = '';
  }

  saveStatus(order: any) {
    this.ordersService
      .updateOrderStatus(order.id, this.selectedStatus)
      .subscribe({
        next: () => {
          order.status = this.selectedStatus;
          this.cancelEdit();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}