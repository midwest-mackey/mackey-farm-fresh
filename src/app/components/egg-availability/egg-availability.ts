import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-egg-availability',
  standalone: false,
  templateUrl: './egg-availability.html',
  styleUrl: './egg-availability.scss',
})
export class EggAvailability implements OnInit, OnDestroy {

  available = false;

  private sub = new Subscription();

  constructor(private ordersService: OrdersService) {}

  ngOnInit() {
    this.sub.add(
      this.ordersService.settings$.subscribe(settings => {
        this.available = settings?.eggsAvailable ?? false;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}