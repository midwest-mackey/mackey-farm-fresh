import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-egg-availability',
  standalone: false,
  templateUrl: './egg-availability.html',
  styleUrl: './egg-availability.scss',
})
export class EggAvailability implements OnInit {

  available = false;

  constructor(private ordersService: OrdersService) {}

  ngOnInit() {
    // 🔥 force sync refresh when component mounts
    this.ordersService.refreshSettings();

    this.ordersService.settings$.subscribe(settings => {
      this.available = settings?.eggsAvailable ?? false;
    });
  }
}