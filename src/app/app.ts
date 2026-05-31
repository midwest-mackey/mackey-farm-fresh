import {
  Component,
  signal,
  OnInit,
  HostListener
} from '@angular/core';
import { OrdersService } from './services/orders.service';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {

  protected readonly title = signal('Mackey\'s Farm Fresh Eggs');

  hasOrders$!: Observable<boolean>;
  unitEggPrice = 0;

  constructor(
    private ordersService: OrdersService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.hasOrders$ = this.ordersService.hasOrders$;

    this.ordersService.refreshOrderState();

    this.ordersService.refreshSettings();
    
    this.auth.loadUser().subscribe();

    this.ordersService.settings$.subscribe((settings) => {
      if (settings?.unitEggPrice != null) {
        this.unitEggPrice = settings.unitEggPrice;
      }
    });

    this.updatePageBackground();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.updatePageBackground();
  }

  private updatePageBackground() {
    const scrolled = window.scrollY > 150;
    const color = scrolled ? '#ffffff' : '#FFC107';

    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  }
}