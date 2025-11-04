import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private router = inject(Router);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      const authenticatedUser = this.userService.authenticate(username!, password!);
      
      if (authenticatedUser) {
        // Store current user in localStorage (only on browser)
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify({
            id: authenticatedUser.id,
            username: authenticatedUser.username,
            role: authenticatedUser.role
          }));
        }
        
        // Clear error message and navigate to dashboard
        this.errorMessage = '';
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Invalid username or password';
        this.loginForm.reset();
      }
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly';
    }
  }
}
