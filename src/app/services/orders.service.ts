import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { DeviceService } from './device.service';

export interface AppSettings {
  eggsAvailable: boolean;
  unitEggPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private apiUrl = environment.apiUrl;

  // ----------------------------
  // 📦 reactive state
  // ----------------------------
  private hasOrdersSubject = new BehaviorSubject<boolean>(false);
  hasOrders$ = this.hasOrdersSubject.asObservable();

  private latestOrderSubject = new BehaviorSubject<any>(null);
  latestOrder$ = this.latestOrderSubject.asObservable();

  private settingsSubject = new BehaviorSubject<AppSettings>({
    eggsAvailable: true,
    unitEggPrice: 5
  });

  settings$ = this.settingsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private deviceService: DeviceService
  ) {
    this.refreshSettings();
  }

  // =====================================================
  // 🥚 SETTINGS (runtime API state)
  // =====================================================

  getSettings() {
    return this.http.get<AppSettings>(
      `${this.apiUrl}/orders/settings`
    );
  }

  updateSettings(payload: Partial<AppSettings>) {
    return this.http.patch(
      `${this.apiUrl}/admin/orders/settings`,
      payload
    );
  }

  refreshSettings() {
    this.getSettings().subscribe({
      next: (settings: AppSettings) => {

        const safeSettings: AppSettings = {
          eggsAvailable: settings?.eggsAvailable ?? true,
          unitEggPrice: settings?.unitEggPrice ?? 5
        };

        this.settingsSubject.next(safeSettings);
      },

      error: (err) => {
        console.error('❌ settings load failed', err);

        const fallback: AppSettings = {
          eggsAvailable: true,
          unitEggPrice: 5
        };

        this.settingsSubject.next(fallback);
      }
    });
  }

  // helper (IMPORTANT for components like egg-order-form)
  getSettingsSnapshot(): AppSettings {
    return this.settingsSubject.value;
  }

  // =====================================================
  // 💰 PRICING (derived ONLY from settings)
  // =====================================================

  getUnitEggPrice(): number {
    return this.settingsSubject.value?.unitEggPrice ?? 5;
  }

  // =====================================================
  // 🥚 ORDERS
  // =====================================================

  submitOrder(order: any) {
    return this.http.post(
      `${this.apiUrl}/orders/all`,
      order
    );
  }

  getMyOrders(deviceId: string) {
    return this.http.get<any[]>(
      `${this.apiUrl}/orders/history?deviceId=${deviceId}`
    );
  }

  getAllOrders() {
    return this.http.get<any[]>(
      `${this.apiUrl}/admin/orders/all`
    );
  }

  getOrderById(id: string) {
    return this.http.get<any>(`/api/orders/${id}`);
  }
  
  reorder(orderId: number) {
    return this.http.post(
      `${this.apiUrl}/orders/reorder/${orderId}`,
      {}
    );
  }

  cancelOrder(orderId: number) {
    const deviceId = this.deviceService.getDeviceId();

    return this.http.post(
      `${this.apiUrl}/orders/cancel/${orderId}`,
      { deviceId }
    );
  }

  refreshOrderState() {
    const deviceId = this.deviceService.getDeviceId();

    this.http.get<any[]>(
      `${this.apiUrl}/orders/history?deviceId=${deviceId}`
    ).subscribe(orders => {
      this.hasOrdersSubject.next(orders.length > 0);
    });
  }

  updateOrder(orderId: number, payload: any) {
    return this.http.patch(
      `${this.apiUrl}/admin/orders/${orderId}/update`,
      payload
    );
  }

  markNotified(id: number, status: string) {
    return this.http.patch(
      `${this.apiUrl}/admin/orders/${id}/notified`,
      { status }
    );
  }
}