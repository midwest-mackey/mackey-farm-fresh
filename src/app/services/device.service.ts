import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  private key = 'device_id';

  getDeviceId(): string {
    let id = localStorage.getItem(this.key);

    if (!id) {
      id = uuidv4();
      localStorage.setItem(this.key, id);
    }

    return id;
  }
}