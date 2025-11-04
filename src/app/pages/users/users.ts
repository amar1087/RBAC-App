import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { UserService, User } from '../../services/user.service';
import { RoleService, Role } from '../../services/role.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class Users {
  private router = inject(Router);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private platformId = inject(PLATFORM_ID);

  showForm = false;
  users: User[] = [];
  roles: String[] = [];
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'phone', 'role', 'actions'];
  selectedUser: User | null = null;
  currentUser: any;

  userForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{10}$/)] }),
    role: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dateOfBirth: new FormControl<Date | null>(null, { validators: [Validators.required] }),
  });


  ngOnInit(): void {
    this.loadUsers();
    this.loadCurrentUser();
    this.loadRoles();
  }

  loadCurrentUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  canCreateUser(): boolean {
    return this.roleService.hasPermission(this.currentUser?.role, 'create');
  }

  canUpdateUser(): boolean {
    return this.roleService.hasPermission(this.currentUser?.role, 'update');
  }

  canDeleteUser(): boolean {
    return this.roleService.hasPermission(this.currentUser?.role, 'delete');
  }


  loadUsers(): void {
    this.users = this.userService.getUsers();
  }

  loadRoles(): void {
    this.roles = this.roleService.getRoles().map(role => role.name);
  }

  showAddUserForm(): void {
    this.selectedUser = null;
    this.resetForm();
    this.showForm = true;
  }

  onSave(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      this.userService.addUser({
        username: formValue.username!,
        password: formValue.password!,
        firstName: formValue.firstName!,
        lastName: formValue.lastName!,
        email: formValue.email!,
        phone: formValue.phone!,
        role: formValue.role!,
        dateOfBirth: formValue.dateOfBirth ?? null
      });
      console.log('User saved:', this.userForm.value);
      alert('User saved successfully!');
      this.loadUsers(); // Reload users from service
      this.showForm = false;
      this.resetForm();
    } else {
      this.userForm.markAllAsTouched();
      alert('Please fill all required fields correctly.');
    }
  }

  onUpdate(): void {
    if (this.userForm.valid && this.selectedUser) {
      this.userService.updateUser(this.selectedUser.id, this.userForm.value);
      console.log('User updated:', this.userForm.value);
      alert('User updated successfully!');
      this.loadUsers(); // Reload users from service
      this.showForm = false;
      this.resetForm();
      this.selectedUser = null;
    } else {
      this.userForm.markAllAsTouched();
      alert('Please fill all required fields correctly.');
    }
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.showForm = true;
    this.userForm.patchValue({
      username: user.username,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      dateOfBirth: user.dateOfBirth
    });
  }

  deleteUser(user: User): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(user.id);
      console.log('User deleted:', user);
      alert('User deleted successfully!');
      this.loadUsers(); // Reload users from service
    }
  }

  onCancel(): void {
    this.showForm = false;
    this.resetForm();
    this.selectedUser = null;
  }

  resetForm(): void {
    this.userForm.reset();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
