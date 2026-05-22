import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {

  faArrowLeft = faArrowLeft;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

   logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
