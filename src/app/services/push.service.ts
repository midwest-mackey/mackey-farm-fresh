import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface VapidResponse {
  publicKey: string;
}

@Injectable({ providedIn: 'root' })
export class PushService {
  private publicKey: string | null = null;

  constructor(private http: HttpClient) {}

  // LOAD PUBLIC KEY FROM BACKEND
  loadPublicKey(): Promise<string> {
    return firstValueFrom(
      this.http.get<VapidResponse>(
        `${environment.apiUrl}/push/public-key`
      )
    ).then(res => {
      this.publicKey = res.publicKey;
      return this.publicKey;
    });
  }

  // GET PUBLIC KEY
  getKey() {
    return this.publicKey;
  }

  // GET CURRENT SUBSCRIPTION
  async getSubscription(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator)) return null;

    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  }

  async isPushEnabled(): Promise<boolean> {
    const sub = await this.getSubscription();
    return !!sub;
  }

  // SAVE SUBSCRIPTION TO BACKEND
  saveSubscription(subscription: PushSubscription) {
    return firstValueFrom(
      this.http.post(
        `${environment.apiUrl}/push/subscribe`,
        { subscription }
      )
    );
  }

  // GET STATUS
  async getStatus() {
    const permission = Notification.permission;

    if (!navigator.serviceWorker) {
      return { permission, subscribed: false };
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      return {
        permission,
        subscribed: !!sub
      };
    } catch (err) {
      return {
        permission,
        subscribed: false
      };
    }
  }

}