import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { OrdersService } from '../../services/orders.service';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss'],
  standalone: false
})
export class Orders implements OnInit, OnDestroy {

  orders: any[] = [];
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

    this.ordersService.getMyOrders(this.deviceId)
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
      case 'pending': return 'text-bg-warning';
      case 'ready': return 'text-bg-info';
      case 'completed': return 'text-bg-success';
      case 'cancelled': return 'text-bg-danger';
      default: return 'text-bg-secondary';
    }
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}