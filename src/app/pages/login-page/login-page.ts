import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})

export class LoginPage {

  faArrowLeft = faArrowLeft;
  error = false;
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  login() {
    console.log("🔥 LOGIN CLICKED");

    const { email, password } = this.loginForm.value;

    this.auth.login(email, password).subscribe({
      next: () => {
        this.error = false;
        this.router.navigate(['/admin']);
      },
      error: (err: any) => {
        this.error = true;
      }
    });
  }
  ngOnInit() {
    localStorage.setItem('hasSeenLogin', 'true');
  }
}