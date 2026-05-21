import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {

  username = 'midwest.mackey';
  password = '2015Luman!';
  error = false;
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  login() {
    const { username, password } = this.loginForm.value;

    const success = this.auth.login(username, password);

    if (success) {
      this.router.navigate(['/admin']);
    }
  }

}


  