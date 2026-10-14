import {
  Component,
  signal,
  OnInit,
  HostListener
} from '@angular/core';
import { OrdersService } from '../.././services/orders.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../.././services/auth.service';
import { faArrowRight, faArrowRightToBracket, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {

  private static preloaderShown = false;
  private readonly preloaderSessionKey = 'farmFreshPreloaderShown';

  preloaderVisible = true;
  siteRevealed = false;
  revealAnimating = false;

  readonly currentYear = new Date().getFullYear();

  faArrowRight = faArrowRight;
  faLogin = faArrowRightToBracket;
  faLogout = faArrowRightFromBracket;

  private tapCount = 0;
  private tapTimeout: any;

  protected readonly title = signal('Mackey\'s Farm Fresh Eggs');

  hasOrders$!: Observable<boolean>;
  unitEggPrice = 0;

  constructor(private ordersService: OrdersService, public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.initializePreloader();
    this.hasOrders$ = this.ordersService.hasOrders$;
    this.ordersService.refreshOrderState();
    this.ordersService.refreshSettings();
    this.ordersService.settings$.subscribe(settings => {
      if (settings?.unitEggPrice != null) {
        this.unitEggPrice = settings.unitEggPrice;
      }
    });

    this.updatePageBackground();
  }

  revealSite(): void {
    this.siteRevealed = true;
    this.revealAnimating = true;
  }

  finishPreloader(): void {
    this.preloaderVisible = false;
    this.revealAnimating = false;
  }

  private initializePreloader(): void {
    if (typeof window === 'undefined') return;

    let alreadyShown = MainLayout.preloaderShown;
    try {
      alreadyShown = alreadyShown || sessionStorage.getItem(this.preloaderSessionKey) === 'true';
      sessionStorage.setItem(this.preloaderSessionKey, 'true');
    } catch {
      // Keep navigation from replaying the intro when browser storage is unavailable.
    }

    MainLayout.preloaderShown = true;
    this.preloaderVisible = !alreadyShown;
    this.siteRevealed = alreadyShown;
  }

  @HostListener('window:scroll')
  onScroll() {
    this.updatePageBackground();
  }

  private updatePageBackground() {
    const scrolled = window.scrollY > 300;
    const color = scrolled ? '#ffffff' : '#FFC107';

    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  }

   logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
  get showLoginButton(): boolean {
    return localStorage.getItem('hasSeenLogin') === 'true';
  }

  logoTapped(): void {
    this.tapCount++;

    if (this.tapCount >= 5) {
      this.tapCount = 0;
      this.router.navigate(['/login']);
      return;
    }

    clearTimeout(this.tapTimeout);
    this.tapTimeout = setTimeout(() => {
      this.tapCount = 0;
    }, 3000);
  }
}
