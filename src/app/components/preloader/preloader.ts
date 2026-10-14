import { isPlatformBrowser } from '@angular/common';
import {
  Component, EventEmitter, Inject, OnDestroy, OnInit, Output, PLATFORM_ID
} from '@angular/core';

@Component({
  selector: 'app-preloader',
  standalone: false,
  templateUrl: './preloader.html',
  styleUrl: './preloader.scss'
})
export class Preloader implements OnInit, OnDestroy {
  @Output() reveal = new EventEmitter<void>();
  @Output() finished = new EventEmitter<void>();

  readonly scenes = [
    { image: 'assets/chicken.png', message: 'Getting the coop ready', caption: 'A little farm-fresh goodness is on its way.' },
    { image: 'assets/eggs-carton.png', message: 'Checking for eggs', caption: 'Counting today’s little golden treasures.' },
    { image: 'assets/chicken.png', message: 'Our chickens are on vacation', caption: 'Even the hardest-working hens need a break.' }
  ];

  scene = this.scenes[0];
  leaving = false;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private started = false;
  private reducedMotion = false;
  private previousOverflow = '';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.scene = this.scenes[Math.floor(Math.random() * this.scenes.length)];
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Continue even if the illustration takes too long or fails to load.
    this.schedule(() => this.imageReady(), 1200);
  }

  imageReady(): void {
    if (!isPlatformBrowser(this.platformId) || this.started) return;
    this.started = true;
    this.schedule(() => {
      this.leaving = true;
      this.reveal.emit();
      this.schedule(() => this.finished.emit(), this.reducedMotion ? 0 : 1000);
    }, this.reducedMotion ? 600 : 2400);
  }

  private schedule(callback: () => void, delay: number): void {
    this.timers.push(setTimeout(callback, delay));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.previousOverflow;
    }
  }
}
