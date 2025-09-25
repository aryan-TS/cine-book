import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  activeRole: 'user' | 'admin' = 'user';
  activeTab: 'login' | 'register' = 'login';
  loggedInUser: string | null = null;

  adminForm: FormGroup;
  userLoginForm: FormGroup;
  userRegisterForm: FormGroup;
  forgotPasswordForm: FormGroup;

  showPassword = false;
  showConfirmPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;

  showForgotPassword = false;

  // returnUrl to go back after login/register
  returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // build forms (same as your existing)
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.userLoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.userRegisterForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.forgotPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.authService.loggedInUser$.subscribe(
      (u) => (this.loggedInUser = u?.fullName || null)
    );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['role']) this.activeRole = params['role'];
      if (params['tab']) this.activeTab = params['tab'];
      if (params['returnUrl']) this.returnUrl = params['returnUrl'];
    });
  }

  setRole(role: 'user' | 'admin') {
    this.activeRole = role;
  }
  setTab(tab: 'login' | 'register') {
    this.activeTab = tab;
  }

  passwordMatchValidator(group: FormGroup) {
    const pass =
      group.get('password')?.value || group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { notMatching: true };
  }

  onAdminLogin() {
    if (this.adminForm.valid) {
      this.authService.loginAdmin(this.adminForm.value).subscribe({
        next: (res) => {
          // admin should go to admin page
          this.router.navigateByUrl('/admin');
        },
        error: (err) => alert(err?.error?.message || 'Admin login failed'),
      });
    }
  }

  onUserLogin() {
    if (this.userLoginForm.valid) {
      this.authService.loginUser(this.userLoginForm.value).subscribe({
        next: (res) => {
          // user goes back to returnUrl (if provided) or movies
          this.router.navigateByUrl(this.returnUrl || '/movies');
        },
        error: (err) => alert(err?.error?.message || 'Login failed'),
      });
    }
  }

  onUserRegister() {
    if (this.userRegisterForm.valid) {
      this.authService.registerUser(this.userRegisterForm.value).subscribe({
        next: (res) => {
          this.router.navigateByUrl(this.returnUrl || '/movies');
        },
        error: (err) => alert(err?.error?.message || 'Registration failed'),
      });
    }
  }

  openForgotPassword() {
    this.showForgotPassword = true;
  }
  closeForgotPassword() {
    this.showForgotPassword = false;
    this.forgotPasswordForm.reset();
  }

  onForgotPassword() {
    if (this.forgotPasswordForm.valid) {
      const email =
        this.userLoginForm.get('email')?.value ||
        this.userRegisterForm.get('email')?.value ||
        this.authService.getUser()?.email;
      if (!email) {
        alert('Please enter your email in the login/register field first');
        return;
      }
      const payload = {
        email,
        newPassword: this.forgotPasswordForm.value.newPassword,
      };
      this.authService.resetPassword(payload).subscribe({
        next: (res) => {
          alert(res?.message || 'Password reset');
          this.closeForgotPassword();
          this.router.navigateByUrl(this.returnUrl || '/movies');
        },
        error: (err) => alert(err?.error?.message || 'Password reset failed'),
      });
    }
  }
}
