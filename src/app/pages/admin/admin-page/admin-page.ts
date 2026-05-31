import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { OrdersService } from '../../../services/orders.service';
import { faCheck, faCircleCheck, faQuoteLeft, faQuoteRight, faEdit, faXmark, faCommentSms, faInbox } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-page',
  standalone: false,
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage implements OnInit, OnDestroy {

  faEdit = faEdit;
  faCheck = faCheck;
  faQuoteLeft = faQuoteLeft;
  faQuoteRight = faQuoteRight;
  faCircleCheck = faCircleCheck;
  faXmark = faXmark;
  faMessage = faCommentSms;  
  faInbox = faInbox;
  

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

  showCompleted = false;

  isStatusNotified(order: any, status: string): boolean {
    return !!order[`${status}NotifiedAt`];
  }

  get activeOrders() {
    const finalStates = ['completed', 'cancelled'];

    return this.orders.filter(o => {
      if (o.status === 'completed') {
        return !this.isStatusNotified(o, 'completed');
      }

      if (o.status === 'cancelled') {
        return !this.isStatusNotified(o, 'cancelled');
      }

      return true;
    });
  }

  get completedOrders() {
    return this.orders.filter(o => {
      if (o.status === 'completed') {
        return this.isStatusNotified(o, 'completed');
      }

      if (o.status === 'cancelled') {
        return this.isStatusNotified(o, 'cancelled');
      }

      return false;
    });
  }

  // -------------------------
  // STATUS UI
  // -------------------------
  getStatusClass(status: string) {
    switch (status) {
      case 'requested': return 'badge text-bg-warning';
      case 'approved': return 'badge text-bg-success';
      case 'modified': return 'badge text-bg-danger';
      case 'ready': return 'badge text-bg-success';
      case 'completed': return 'badge text-bg-success';
      case 'cancelled': return 'badge text-bg-dark';
      default: return 'badge text-bg-primary';
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
    const BASE_URL = 'https://eggs.midwestmackey.com';

    switch (status) {
      case 'requested':
        return `🥚 Hey ${order.name}! Your request for ${order.dozenCount} dozen eggs has been received!
        
        👉 Check status: ${BASE_URL}/?ref=message&status=${order.status}`;

      case 'approved':
        return `🎉 ${order.name}! We have your ${order.dozenCount} dozen eggs and we're getting them ready.`;

      case 'modified':
        return `🫠 ${order.name}, we need to make a change to your egg order. Please reply to discuss.`;

      case 'ready':
        return `🎉 ${order.name}, your ${order.dozenCount} dozen egg order is ready for pickup, your total is $${order.totalPrice}, what time ${order.pickupDate} works for you to pickup?`;

      case 'completed':
        return `🐔 Your order is complete! We appreciate your support of Mackey's Farm Fresh Eggs!
        
👉 Get your next order here: ${BASE_URL}/?ref=message&status=${order.status}`;

      case 'cancelled':
        return `🐔 Hey ${order.name}, unfortunately we aren't able to fulfill your order at this time, we will reach out with additional details.
        
👉 Reorder here: ${BASE_URL}/orders/?ref=message&status=${order.status}`;

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