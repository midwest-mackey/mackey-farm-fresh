import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { OrdersService } from '../../../services/orders.service';
import { faCheck, faCircleCheck, faEdit, faXmark, faCommentSms } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-page',
  standalone: false,
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage implements OnInit, OnDestroy {

  faEdit = faEdit;
  faCheck = faCheck;
  faCircleCheck = faCircleCheck;
  faXmark = faXmark;
  faMessage = faCommentSms;  
  

  orders: any[] = [];
  loading = true;

  selectedQuantity: number = 1;
  quantityOptions: number[] = [1, 2, 3, 4, 5, 6, 8, 10];

  private destroy$ = new Subject<void>();

  editingOrderId: number | null = null;
  selectedStatus = '';

  statuses = [
    'requested',
    'approved',
    'modified',
    'ready',
    'completed',
    'cancelled'
  ];

  constructor(
    private router: Router,
    private ordersService: OrdersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  // -------------------------
  // LOAD ORDERS
  // -------------------------
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

  // -------------------------
  // STATUS UI
  // -------------------------
  getStatusClass(status: string) {
    switch (status) {
      case 'requested': return 'text-bg-warning';
      case 'approved': return 'text-bg-success approved';
      case 'modified': return 'text-bg-danger';
      case 'ready': return 'text-bg-success';
      case 'completed': return 'text-bg-secondary';
      case 'cancelled': return 'text-bg-dark';
      default: return 'text-bg-primary';
    }
  }

  // -------------------------
  // EDIT STATE
  // -------------------------
  startEdit(order: any) {
    this.editingOrderId = order.id;
    this.selectedStatus = order.status;
    this.selectedQuantity = order.dozenCount ?? 1;
  }

  cancelEdit() {
    this.editingOrderId = null;
    this.selectedStatus = '';
  }

  // -------------------------
  // SAVE Order
  // -------------------------
  saveOrder(order: any) {
    const orderId = order.id;

    this.ordersService.updateOrder(orderId, {
      status: this.selectedStatus,
      dozenCount: this.selectedQuantity
    }).subscribe({
      next: () => {

        this.orders = this.orders.map(o =>
          o.id === orderId
            ? {
                ...o,
                status: this.selectedStatus,
                dozenCount: this.selectedQuantity
              }
            : o
        );

        this.orders = [...this.orders];
        this.cancelEdit();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getCustomerMessage(order: any, status: string) {
    switch (status) {
      case 'requested':
        return `🥚 Hey ${order.name}! Your request for ${order.dozenCount} dozen eggs has been received!`;

      case 'approved':
        return `🎉 ${order.name}! We have your ${order.dozenCount} dozen eggs and we're getting them ready.`;

      case 'modified':
        return `🫠 ${order.name}, we need to make a change to your egg order. Please reply to discuss.`;

      case 'ready':
        return `🎉 ${order.name}, your ${order.dozenCount} dozen egg order is ready for pickup, your total is $${order.totalPrice}, what time ${order.pickupDate} works for you to pickup?`;

      case 'completed':
        return `🐔 Your order is complete! We appreciate your support of Mackey Farm Fresh Eggs, we look forward to your next order!`;

      case 'cancelled':
        return `🐔 Hey ${order.name}, unfortunately we aren't able to fulfill your order at this time, we will reach out with additional details.`;

      default:
        return '';
    }
  }


  textCustomer(order: any) {

    const status = order.status;
    const column = `${status}NotifiedAt`;

    const alreadyNotified = !!order[column];

    const message = this.getCustomerMessage(order, status);

    window.open(
      `sms:${order.phoneNumber}?body=${encodeURIComponent(message)}`
    );

    if (!alreadyNotified) {
      this.ordersService.markNotified(order.id, status)
        .subscribe({
          next: () => {
            order[column] = new Date().toISOString();

            // force refresh
            this.orders = [...this.orders];
          },
          error: (err) => {
            console.error('❌ notify failed', err);
          }
        });
    }
  }
  
  isNotified(order: any): boolean {
    const column = `${order.status}NotifiedAt`;
    return !!order[column];
  }

  getNotifiedStatuses(order: any) {
    const statuses = [
      'requested',
      'approved',
      'modified',
      'ready',
      'completed',
      'cancelled'
    ];

    return statuses
      .filter(status => !!order[`${status}NotifiedAt`])
      .map(status => ({
        status,
        time: order[`${status}NotifiedAt`]
      }));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}