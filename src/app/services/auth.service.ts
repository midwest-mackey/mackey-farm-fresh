import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { PushService } from './push.service';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private tokenKey = 'token';

  private authState = new BehaviorSubject<boolean>(this.hasToken());
  auth$ = this.authState.asObservable();

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private pushService: PushService
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
        this.userSubject.next(res.user);

        this.initAdminFeatures(res.user);
      })
    );
  }

  loadUser() {
    return this.getMe().pipe(
      tap(user => {
        this.userSubject.next(user);
        this.authState.next(true);

        this.initAdminFeatures(user);
      })
    );
  }

  private initAdminFeatures(user: User) {
    if (user?.role === 'admin') {
      this.pushService.loadPublicKey()
        .then(() => {
          console.log('🔔 Admin push enabled');
        });
    }
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

  createAdmin(data: { email: string; password: string }) {
    return this.http.post<any>(
      `${environment.apiUrl}/admin/admins`,
      data
    );
  }

  deleteAdmin(id: number) {
    return this.http.delete<any>(
      `${environment.apiUrl}/admin/admins/${id}`
    );
  }

}