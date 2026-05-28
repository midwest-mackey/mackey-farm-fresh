import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { OrdersService, AppSettings } from '../../../services/orders.service';
import { faCheck, faDollarSign, faXmark, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings-page',
  standalone: false,
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss'
})
export class SettingsPage implements OnInit, OnDestroy {

  faCheck = faCheck;
  faXmark = faXmark;
  faDollarSign = faDollarSign;
  faCirclePlus = faCirclePlus;

  settings: AppSettings = {
    eggsAvailable: true,
    unitEggPrice: 5
  };

  saving = false;

  admins: any[] = [];

  private sub = new Subscription();

  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.accountForm = this.fb.group({
      email: [''],
      currentPassword: [''],
      newPassword: ['']
    });
  }
  
  ngOnInit() {

    this.sub.add(
      this.ordersService.settings$.subscribe(settings => {
        if (settings) {
          this.settings = { ...settings };
        }
      })
    );

    this.sub.add(
      this.authService.getMe().subscribe({
        next: (res) => {
          this.accountForm.patchValue({
            email: res.user.email
          });
        },
        error: (err: any) => {
          console.error('Failed to load user', err);
        }
      })
    );

    this.ordersService.refreshSettings();
    
    this.loadAdmins();
    
  }

  saveSettings() {
    this.saving = true;

    this.ordersService.updateSettings(this.settings)
      .subscribe({
        next: () => {
          this.saving = false;

          // 🔥 single source of truth refresh
          this.ordersService.refreshSettings();
        },
        error: (err) => {
          console.error(err);
          this.saving = false;
        }
      });
  }

  accountForm: FormGroup;

  updateAccount() {
    console.log(this.accountForm.value);
    if (this.accountForm.invalid) return;

    this.authService.updateAdminAccount(this.accountForm.value)
    .subscribe({
      next: () => {
        alert('Account updated successfully');
      },
      error: (err: any) => {
        console.error(err);
        alert(err?.error?.error || 'Update failed');
      }
    });
  }


  loadAdmins() {
    this.authService.getAdmins().subscribe({
      next: (res) => {
        this.admins = res.admins;
        console.log("ADMIN ARRAY:", this.admins);
      },
      error: (err: any) => {
        console.error('Failed to load admins', err);
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}