import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { OrdersService } from '../../services/orders.service';
import { DeviceService } from '../../services/device.service';

import { faCircleCheck, faCircleXmark, faRotate, faQuoteLeft, faQuoteRight, faCommentSms, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faVenmoV } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss'],
  standalone: false
})
export class Orders implements OnInit, OnDestroy {

  faCircleCheck = faCircleCheck;
  faCircleXmark = faCircleXmark;
  faQuoteLeft = faQuoteLeft;
  faQuoteRight = faQuoteRight;
  faPhone = faPhone;
  faMessage = faCommentSms;  
  faVenmo = faVenmoV;
  faRotate = faRotate;

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

  confirmingReorderId: string | null = null;
  successfulReorderId: string | null = null;

  showReorderConfirm(orderId: string) {
    this.confirmingReorderId = orderId;
  }

  cancelReorder() {
    this.confirmingReorderId = null;
  }

  reorder(order: any) {
    this.ordersService.reorder(order.id).subscribe({
      next: () => {
        // clear confirm state
        this.confirmingReorderId = null;

        // show success state
        this.successfulReorderId = order.id;

        // refresh orders
        this.loadOrders();

        // revert after 3 sec
        setTimeout(() => {
          if (this.successfulReorderId === order.id) {
            this.successfulReorderId = null;
          }
        }, 5000);
      },
      error: (err) => {
        console.error('Reorder failed', err);
        this.confirmingReorderId = null;
      }
    });
  }

  canReorder(order: any): boolean {
    return ['completed', 'cancelled'].includes(order.status);
  }

  confirmingCancelId: number | null = null;
  successfulCancelId: number | null = null;
  
  showCancelConfirm(orderId: number) {
    this.confirmingCancelId = orderId;
  }

  cancelCancel() {
    this.confirmingCancelId = null;
  }

  cancelOrder(order: any) {
    this.ordersService.cancelOrder(order.id).subscribe({
      next: () => {
        this.confirmingCancelId = null;
        this.successfulCancelId = order.id;

        this.loadOrders();

        setTimeout(() => {
          this.successfulCancelId = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Cancel failed', err);
      }
    });
  }

  canVenmo(order: any) {
    return (
      order.paymentType === 'venmo' &&
      ['approved', 'modified', 'ready'].includes(order.status)
    );
  }

  getStatusInfo(status: string) {
    switch (status) {
      case 'requested':
        return { class: 'badge text-bg-warning', text: 'Requested' };
      case 'approved':
        return { class: 'badge text-bg-success', text: 'Approved' };
      case 'modified':
        return { class: 'badge text-bg-danger', text: 'Modified' };
      case 'ready':
        return { class: 'badge text-bg-success', text: 'Ready for pickup' };
      case 'completed':
        return { class: 'text-success small', text: 'Thank you!' };
      case 'cancelled':
        return { class: 'text-dark small', text: 'Bummer, order cancelled' };
      default:
        return { class: 'badge text-bg-primary', text: status };
    }
  }

  getSmsLink(): string {
    if (!this.newestOrder) return '';

    const msg = `🥚 Hey, this is ${this.newestOrder.name}, I have a question about my most recent order.`;

    return `sms:5155180989?body=${encodeURIComponent(msg)}`;
  }

  openVenmo(orderId: string) {
    console.log('VENMO CLICK:', orderId);

    const order = this.orders.find(o => o.id === orderId);

    if (!order) {
      console.error('Order not found in local cache');
      return;
    }

    const username = 'smackey15';

    const note = encodeURIComponent(
      `🥚 ${order.dozenCount} dozen eggs`
    );

    const appUrl =
      `venmo://paycharge?txn=pay&recipients=${username}` +
      `&amount=${order.totalPrice}&note=${note}`;

    const webUrl = `https://venmo.com/${username}`;

    window.location.href = appUrl;

    setTimeout(() => {
      window.open(webUrl, '_blank');
    }, 1500);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}