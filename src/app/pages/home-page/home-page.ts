import { Component } from '@angular/core';
import { faCommentSms, faPhone } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  faPhone = faPhone;
  faMessage = faCommentSms;
}
