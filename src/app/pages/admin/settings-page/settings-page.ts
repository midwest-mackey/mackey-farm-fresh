import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { OrdersService, AppSettings } from '../../../services/orders.service';
import { PushService } from '../../../services/push.service';

import {
  faCheck,
  faDollarSign,
  faXmark,
  faCirclePlus,
  faTrash,
  faShop,
  faUsers,
  faUserPen,
  faBell
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-settings-page',
  standalone: false,
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss'
})
export class SettingsPage implements OnInit, OnDestroy {

  // Icons
  faCheck = faCheck;
  faXmark = faXmark;
  faDollarSign = faDollarSign;
  faCirclePlus = faCirclePlus;
  faTrash = faTrash;
  faShop = faShop;
  faUsers = faUsers;
  faUserPen = faUserPen;
  faBell = faBell;

  // State
  settings: AppSettings = {
    eggsAvailable: true,
    unitEggPrice: 5
  };

  pushEnabled = false;

  pushState = {
    subscribed: false,
    permission: Notification.permission,
    loading: false
  };

  saving = false;
  admins: any[] = [];
  showAddAdmin = false;
  accountForm: FormGroup;
  addAdminForm: FormGroup;

  private sub = new Subscription();

  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder,
    private authService: AuthService,
    private pushService: PushService,
    private cd: ChangeDetectorRef
  ) {

    this.accountForm = this.fb.group({
      email: [''],
      currentPassword: [''],
      newPassword: ['']
    });

    this.addAdminForm = this.fb.group({
      email: this.fb.nonNullable.control(''),
      password: this.fb.nonNullable.control('')
    });
  }

  // INIT
  async ngOnInit() {

    this.sub.add(
      this.ordersService.settings$.subscribe(s => {
        if (s) this.settings = { ...s };
      })
    );

    this.sub.add(
      this.authService.getMe().subscribe(res => {
        this.accountForm.patchValue({
          email: res.user.email
        });
      })
    );

    this.ordersService.refreshSettings();
    this.loadAdmins();

    // wait for SW registration
    setTimeout(() => {
      this.refreshPushStatus();
    }, 300);
  }

  // PUSH STATE
  async refreshPushStatus() {
    const status = await this.pushService.getStatus();

    this.pushState.permission = status.permission;
    this.pushState.subscribed = status.subscribed;

    this.cd.detectChanges(); // IMPORTANT
  }

  // ENABLE PUSH NOTIFICATIONS
  async enablePush() {
    try {
      this.pushState.loading = true;

      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        this.pushState.subscribed = false;
        this.pushState.loading = false;
        this.cd.detectChanges();
        return;
      }

      const publicKey = await this.pushService.loadPublicKey();
      const reg = await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });

      await this.pushService.saveSubscription(sub);

      await this.refreshPushStatus();

    } catch (err) {
      console.error(err);
    } finally {
      this.pushState.loading = false;
      this.cd.detectChanges();
    }
  }

  // DISABLE PUSH NOTIFICATIONS
  async disablePush() {
    try {
      this.pushState.loading = true;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await sub.unsubscribe();
      }

      await this.refreshPushStatus();

    } catch (err) {
      console.error(err);
    } finally {
      this.pushState.loading = false;
      this.cd.detectChanges();
    }
  }

  // SAVE SETTINGS
  saveSettings() {
    this.saving = true;

    this.ordersService.updateSettings(this.settings).subscribe({
      next: () => {
        this.saving = false;
        this.ordersService.refreshSettings();
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
      }
    });
  }
  
  // UPDATE ACCOUNT
  updateAccount() {
    if (this.accountForm.invalid) return;

    this.authService.updateAdminAccount(this.accountForm.value).subscribe({
      next: () => alert('Account updated successfully'),
      error: err => alert(err?.error?.error || 'Update failed')
    });
  }

  // GET ADMINS
  loadAdmins() {
    this.authService.getAdmins().subscribe({
      next: res => {
        this.admins = [...res.admins];
      },
      error: err => console.error(err)
    });
  }

  // ADD ADMIN
  addAdmin() {
    if (this.addAdminForm.invalid) return;

    this.authService.createAdmin(this.addAdminForm.value).subscribe({
      next: () => {
        this.showAddAdmin = false;
        this.addAdminForm.reset();
        this.loadAdmins();
      },
      error: err => console.error(err)
    });
  }

  // DELETE ADMIN
  deleteAdmin(admin: any) {
    if (!confirm(`Delete admin ${admin.email}?`)) return;

    this.authService.deleteAdmin(admin.id).subscribe({
      next: () => this.loadAdmins(),
      error: err => console.error(err)
    });
  }

  // UTIL
  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // CLEANUP
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}