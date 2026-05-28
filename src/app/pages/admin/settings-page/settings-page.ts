import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { OrdersService, AppSettings } from '../../../services/orders.service';
import { faCheck, faDollarSign, faXmark, faCirclePlus, faTrash } from '@fortawesome/free-solid-svg-icons';
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
  faTrash = faTrash;

  settings: AppSettings = {
    eggsAvailable: true,
    unitEggPrice: 5
  };

  saving = false;

  // ✅ FIX: initialize as empty array for stable rendering
  admins: any[] = [];

  accountForm: FormGroup;
  addAdminForm: FormGroup;

  showAddAdmin = false;

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

    this.addAdminForm = this.fb.group({
      email: this.fb.nonNullable.control(''),
      password: this.fb.nonNullable.control('')
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
        error: (err) => {
          console.error('Failed to load user', err);
        }
      })
    );

    this.ordersService.refreshSettings();
    this.loadAdmins();
  }

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

  updateAccount() {
    if (this.accountForm.invalid) return;

    this.authService.updateAdminAccount(this.accountForm.value).subscribe({
      next: () => {
        alert('Account updated successfully');
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.error || 'Update failed');
      }
    });
  }

  loadAdmins() {
    this.authService.getAdmins().subscribe({
      next: (res) => {
        // 🔥 IMPORTANT: new reference forces Angular update
        this.admins = [...res.admins];
        console.log("ADMIN ARRAY:", this.admins);
      },
      error: (err) => {
        console.error('Failed to load admins', err);
      }
    });
  }

  addAdmin() {
    if (this.addAdminForm.invalid) return;

    this.authService.createAdmin(this.addAdminForm.value).subscribe({
      next: () => {
        this.showAddAdmin = false;
        this.addAdminForm.reset();
        this.loadAdmins();
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.error || 'Failed to create admin');
      }
    });
  }

  deleteAdmin(admin: any) {
    if (confirm(`Delete admin ${admin.email}? This cannot be undone.`)) {

      // safety lock: self-delete prevention (frontend)
      const currentUser = this.accountForm.value;

      if (currentUser?.email === admin.email) {
        alert("You cannot delete your own account.");
        return;
      }

      this.authService.deleteAdmin(admin.id).subscribe({
        next: () => {
          this.loadAdmins();
        },
        error: (err) => {
          console.error(err);
          alert(err?.error?.error || "Failed to delete admin");
        }
      });
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}