import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard {
  private router = inject(Router);
  private roleService = inject(RoleService);
  private platformId = inject(PLATFORM_ID);

  hasPermission = true; // Dummy permission flag
  currentUser: any;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    }
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }

  navigateToRoles(): void {
    this.router.navigate(['/roles']);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  canManageUsers(): boolean {
    return this.roleService.hasPermission(this.currentUser?.role, 'manage_users');
  }

  canManageRoles(): boolean {
    return this.roleService.hasPermission(this.currentUser?.role, 'manage_roles');
  }

  canRead(): boolean {
    return this.roleService.hasPermission(this.currentUser?.role, 'read');
  }
}
