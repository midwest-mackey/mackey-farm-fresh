import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private tokenKey = 'token';

  private authState = new BehaviorSubject<boolean>(this.hasToken());
  auth$ = this.authState.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  login(email: string, password: string) {
    return this.http.post<any>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap((res: any) => {
        localStorage.setItem(this.tokenKey, res.token);
        this.authState.next(true);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);

    this.authState.next(false);

    this.router.navigate(['/login']);
  }

  getMe() {
    return this.http.get<any>(
      `${environment.apiUrl}/auth/me`
    );
  }

  updateAdminAccount(data: any) {
    return this.http.put(
      `${environment.apiUrl}/auth/account`,
      data,
      {
        withCredentials: true
      }
    );
  }

  getAdmins() {
    return this.http.get<any>(
      `${environment.apiUrl}/admin/admins`
    );
  }

}