import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { OrdersService, AppSettings } from '../../../services/orders.service';
import { PushService } from '../../../services/push.service';

import {
  faCheck,
  faDollarSign,
  faCirclePlus,
  faTrash,
  faShop,
  faUsers,
  faUserPen,
  faBell
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss'
})
export class SettingsPage implements OnInit, OnDestroy {

  // icons
  faCheck = faCheck;
  faDollarSign = faDollarSign;
  faCirclePlus = faCirclePlus;
  faTrash = faTrash;
  faShop = faShop;
  faUsers = faUsers;
  faUserPen = faUserPen;
  faBell = faBell;

  // state
  settings: AppSettings = {
    eggsAvailable: true,
    unitEggPrice: 5
  };

  admins: any[] = [];
  showAddAdmin = false;
  saving = false;

  pushState = {
    subscribed: false,
    permission: 'default',
    loading: false
  };

  userNotifications = {
    smsEnabled: false,
    smsPhoneNumber: ''
  };

  accountForm: FormGroup;
  addAdminForm: FormGroup;

  private sub = new Subscription();

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private pushService: PushService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {

    this.accountForm = this.fb.group({
      email: [''],
      currentPassword: [''],
      newPassword: ['']
    });

    this.addAdminForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  ngOnInit() {

    this.sub.add(
      this.ordersService.settings$.subscribe(s => {
        if (s) this.settings = { ...s };
      })
    );

    this.loadUser();
    this.loadAdmins();

    this.ordersService.refreshSettings();

    setTimeout(() => this.refreshPushStatus(), 300);
  }

  // ---------------- USER ----------------

  loadUser() {
    this.authService.getMe().subscribe({
      next: res => {
        const user = res.user;

        this.accountForm.patchValue({
          email: user.email
        });

        this.userNotifications = {
          smsEnabled: !!user.smsEnabled,
          smsPhoneNumber: user.smsPhoneNumber || ''
        };

        this.pushState.subscribed = !!user.pushEnabled;
      }
    });
  }

  // ---------------- PUSH ----------------

  async refreshPushStatus() {
    const status = await this.pushService.getStatus();

    this.pushState.permission = status.permission;
    this.pushState.subscribed = status.subscribed;

    this.cd.detectChanges();
  }

  async onPushToggle(event: any) {
    if (event.target.checked) {
      await this.enablePush();
    } else {
      await this.disablePush();
    }
  }

  async enablePush() {
    this.pushState.loading = true;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const key = await this.pushService.loadPublicKey();
      const reg = await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(key)
      });

      await this.pushService.saveSubscription(sub);
      await this.refreshPushStatus();

    } finally {
      this.pushState.loading = false;
      this.cd.detectChanges();
    }
  }

  async disablePush() {
    this.pushState.loading = true;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) await sub.unsubscribe();

      await this.refreshPushStatus();

    } finally {
      this.pushState.loading = false;
      this.cd.detectChanges();
    }
  }

  // ---------------- SETTINGS ----------------

  saveSettings() {
    this.saving = true;

    this.ordersService.updateSettings(this.settings).subscribe({
      next: () => {
        this.saving = false;
        this.ordersService.refreshSettings();
      },
      error: err => {
        console.error(err);
        this.saving = false;
      }
    });
  }

  // ---------------- NOTIFICATIONS ----------------

  updateNotifications() {
    const payload = {
      smsEnabled: this.userNotifications.smsEnabled,
      smsPhoneNumber: this.userNotifications.smsPhoneNumber,
      pushEnabled: this.pushState.subscribed
    };

    this.authService.updateNotificationPreferences(payload).subscribe({
      next: () => {
        this.loadUser(); // 🔥 re-sync truth from server
        alert('Preferences updated');
      },
      error: err => {
        alert(err?.error?.error || 'Update failed');
      }
    });
  }

  // ---------------- ADMINS ----------------

  loadAdmins() {
    this.authService.getAdmins().subscribe({
      next: res => this.admins = res.admins,
      error: err => console.error(err)
    });
  }

  addAdmin() {
    if (this.addAdminForm.invalid) return;

    this.authService.createAdmin(this.addAdminForm.value).subscribe({
      next: () => {
        this.showAddAdmin = false;
        this.addAdminForm.reset();
        this.loadAdmins();
      }
    });
  }

  deleteAdmin(admin: any) {
    if (!confirm(`Delete ${admin.email}?`)) return;

    this.authService.deleteAdmin(admin.id).subscribe({
      next: () => this.loadAdmins()
    });
  }

  // ---------------- UTIL ----------------

  private urlBase64ToUint8Array(base64: string) {
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const base64Fixed = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');

    const raw = window.atob(base64Fixed);
    const arr = new Uint8Array(raw.length);

    for (let i = 0; i < raw.length; i++) {
      arr[i] = raw.charCodeAt(i);
    }

    return arr;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}