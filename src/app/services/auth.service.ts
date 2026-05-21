import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private key = 'admin';

  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  auth$ = this.authState.asObservable();

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    const isValid = username === 'midwest.mackey' && password === '2015Luman!';

    if (isValid) {
      localStorage.setItem(this.key, 'true');
      this.authState.next(true);
      return true;
    }

    return false;
  }

  logout() {
    localStorage.removeItem(this.key);
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.key) === 'true';
  }
}