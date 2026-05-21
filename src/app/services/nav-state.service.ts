import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class NavStateService {
  private ordersVisibleSubject = new BehaviorSubject<boolean>(false);

  ordersVisible$ = this.ordersVisibleSubject.asObservable();

  showOrders() {
    this.ordersVisibleSubject.next(true);
  }
}