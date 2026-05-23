import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { OrdersService } from '../../services/orders.service';
import { DeviceService } from '../../services/device.service';

import { faCommentSms, faPhone } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss'],
  standalone: false
})
export class Orders implements OnInit, OnDestroy {

  faPhone = faPhone;
  faMessage = faCommentSms;  

  orders: any[] = [];
  newestOrder: any;
  loading = true;

  deviceId: string;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private ordersService: OrdersService,
    private deviceService: DeviceService,
    private cdr: ChangeDetectorRef
  ) {
    this.deviceId = this.deviceService.getDeviceId();
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadOrders();
      });

    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orders = [];
    this.newestOrder = null;

    this.ordersService.getMyOrders(this.deviceId)
      .subscribe({
        next: (data) => {
          this.orders = [...(data ?? [])];
          this.newestOrder = this.orders[0] ?? null;
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

  reorder(order: any) {
    this.ordersService.reorder(order.id).subscribe({
      next: () => {
        this.loadOrders(); // refresh list
      },
      error: (err) => {
        console.error('Reorder failed', err);
      }
    });
  }

  canReorder(order: any): boolean {
    return ['completed', 'cancelled'].includes(order.status);
  }

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
  getSmsLink(): string {
    if (!this.newestOrder) return '';

    const msg = `🥚 Hey, this is ${this.newestOrder.name}, I have a question about my most recent order.`;

    return `sms:5155180989?body=${encodeURIComponent(msg)}`;
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}