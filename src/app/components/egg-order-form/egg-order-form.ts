import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { OrdersService } from '../../services/orders.service';
import { DeviceService } from '../../services/device.service';
import { faCircleCheck, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faVenmoV } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-egg-order-form',
  templateUrl: './egg-order-form.html',
  styleUrls: ['./egg-order-form.scss'],
  standalone: false,
})
export class EggOrderForm {

  faCheck = faCircleCheck;
  faDollarSign = faDollarSign;
  faVenmo = faVenmoV;
  orderForm: FormGroup;

  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  showNotes = false;

  paymentTypes = [
    { label: 'Cash', value: 'cash' },
    { label: 'Venmo', value: 'venmo' }
  ];
  eggConditions = [
    { label: 'Washed', value: 'washed' },
    { label: 'Unwashed', value: 'unwashed' }
  ];
  pickupDates = [
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'In 2 Days', value: 'in 2 days' },
  ];

  formattedPhone = '';
  submittedOrder: any = null;
  
  available = true;

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private deviceService: DeviceService
  ) {
    this.deviceService.getDeviceId();

    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      paymentType: ['cash', Validators.required],
      dozenCount: [1, [Validators.required, Validators.min(1)]],
      eggCondition: ['washed', Validators.required],
      orderNotes: ['', Validators.maxLength(200)],
      pickupDate: ['today', Validators.required]
    });

    this.ordersService.settings$.subscribe(settings => {
      this.available = settings?.eggsAvailable ?? true;
    });
  }

  get f() {
    return this.orderForm.controls;
  }

  get unitEggPrice(): number {
    return this.ordersService.getUnitEggPrice();
  }

  get eggConditionHelperText(): string {
    const value = this.orderForm.get('eggCondition')?.value;

    switch (value) {
      case 'washed':
        return 'Sanitized and ready, just like the store. Must be stored in the refrigerator.';

      case 'unwashed':
        return 'Natural protective coating left intact. Can be stored on counter, must be washed before consumption.';

      default:
        return '';
    }
  }

  // --------------------------
  // 🥚 DOZEN LOGIC
  // --------------------------

  increaseDozen() {
    const current = this.f['dozenCount'].value;

    if (current < 4) {
      this.f['dozenCount'].setValue(current + 1);
    }
  }

  decreaseDozen() {
    const current = this.f['dozenCount'].value;

    if (current > 1) {
      this.f['dozenCount'].setValue(current - 1);
    }
  }

  onDozenChange() {
    let value = this.f['dozenCount'].value;

    if (value > 4) value = 4;
    if (value < 1) value = 1;

    this.f['dozenCount'].setValue(value);
  }

  // --------------------------
  // 📞 PHONE HANDLING (CLEAN)
  // --------------------------

  onPhoneInput(event: any) {
    const rawDigits = event.target.value.replace(/\D/g, '').slice(0, 10);

    // store RAW value in form
    this.orderForm.get('phoneNumber')?.setValue(rawDigits, {
      emitEvent: false
    });

    // store formatted display separately
    this.formattedPhone = this.formatPhone(rawDigits);
  }

  formatPhone(digits: string): string {
    if (!digits) return '';

    if (digits.length <= 3) {
      return `(${digits}`;
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)})-${digits.slice(3)}`;
    }

    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  toggleNotes() {
    this.showNotes = !this.showNotes;
  }

  // --------------------------
  // 🧾 SUBMIT ORDER
  // --------------------------

  submitOrder() {

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    this.ordersService
      .submitOrder({
        ...this.orderForm.value,
        deviceId: this.deviceService.getDeviceId()
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.submitSuccess = true;

          // save submitted values for success screen
          this.submittedOrder = {
            ...this.orderForm.value
          };

          this.orderForm.reset({
            name: '',
            phoneNumber: '',
            paymentType: 'cash',
            pickupDate: 'today',
            eggCondition: 'washed',
            orderNotes: '',
            dozenCount: 1
          });

          this.formattedPhone = '';

          this.ordersService.refreshOrderState();
        },
        error: (err) => {
          console.error(err);

          this.isSubmitting = false;
          this.submitError = true;
        }
      });
  }

}