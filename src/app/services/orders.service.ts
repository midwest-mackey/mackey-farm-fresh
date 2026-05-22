import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { DeviceService } from './device.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private apiUrl = environment.apiUrl;
  private unitEggPrice = 0;

  private hasOrdersSubject = new BehaviorSubject<boolean>(false);
  hasOrders$ = this.hasOrdersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private deviceService: DeviceService
  ) {}

  getPricing() {
    return this.http.get<{ unitEggPrice: number }>(
      `${this.apiUrl}/orders/pricing`
    );
  }

  setPricing(price: number) {
    this.unitEggPrice = price;
  }

  getUnitEggPrice() {
    return this.unitEggPrice;
  }

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
      `${this.apiUrl}/orders/all`
    );
  }

  refreshOrderState() {
    const deviceId = this.deviceService.getDeviceId();

    this.http.get<any[]>(`${this.apiUrl}/orders/history?deviceId=${deviceId}`)
      .subscribe(orders => {
        this.hasOrdersSubject.next(orders.length > 0);
      });
  }
  updateOrderStatus(
    orderId: number,
    status: string
  ) {
    return this.http.patch(
      `${this.apiUrl}/orders/all/${orderId}/status`,
      { status }
    );
  }
}