import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersService, AppSettings } from '../../../services/orders.service';
import { faCheck, faDollarSign, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings-page',
  standalone: false,
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss'
})
export class SettingsPage implements OnInit, OnDestroy {

  faCheck = faCheck;
  faXmark = faXmark;
  faDollarSign = faDollarSign;

  settings: AppSettings = {
    eggsAvailable: true,
    unitEggPrice: 5
  };

  saving = false;

  private sub = new Subscription();

  constructor(private ordersService: OrdersService) {}

  ngOnInit() {
    this.sub.add(
      this.ordersService.settings$.subscribe(settings => {
        if (settings) {
          this.settings = { ...settings };
        }
      })
    );

    this.ordersService.refreshSettings();
  }

  saveSettings() {
    this.saving = true;

    this.ordersService.updateSettings(this.settings)
      .subscribe({
        next: () => {
          this.saving = false;

          // 🔥 single source of truth refresh
          this.ordersService.refreshSettings();
        },
        error: (err) => {
          console.error(err);
          this.saving = false;
        }
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}