import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-egg-availability',
  standalone: false,
  templateUrl: './egg-availability.html',
  styleUrl: './egg-availability.scss',
})
export class EggAvailability {
    @Input() available = false;
}
