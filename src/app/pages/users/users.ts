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
import { MatTableModule,MatTableDataSource} from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UserService, User } from '../../services/user.service';
import { RoleService, Role } from '../../services/role.service';
import { ErrorHandlerService } from '../../services/error-handler.service';

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
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class Users {
  private router = inject(Router);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private platformId = inject(PLATFORM_ID);
  private snackBar = inject(MatSnackBar);
  private errorHandler = inject(ErrorHandlerService);
  showForm = false;
  filteredUsers: MatTableDataSource<User> = new MatTableDataSource<User>();
  users: User[] = [];
  roles: String[] = [];
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'phone', 'role', 'actions'];
  selectedUser: User | null = null;
  currentUser: any;

  searchFilter = new FormControl('');
  roleFilter = new FormControl('');

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

    // Subscribe to filter changes
    this.searchFilter.valueChanges.subscribe(() => {
      this.applyFilter();
    });
    
    this.roleFilter.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  loadCurrentUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          this.currentUser = JSON.parse(userStr);
        }
      } catch (error) {
        this.errorHandler.showErrorMessage(error, 'Error getting current user');
        this.currentUser = null;
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

  applyFilter(): void {
    let filteredData = [...this.users];

    // Apply search filter
    const searchValue = this.searchFilter.value?.toLowerCase().trim() || '';
    if (searchValue) {
      filteredData = filteredData.filter(user => 
        user.firstName.toLowerCase().includes(searchValue) ||
        user.lastName.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        user.phone.includes(searchValue) ||
        user.username?.toLowerCase().includes(searchValue)
      );
    }

    // Apply role filter
    const roleValue = this.roleFilter.value;
    if (roleValue) {
      filteredData = filteredData.filter(user => user.role === roleValue);
    }

    // Update the filteredUsers data source
    this.filteredUsers.data = filteredData;
  }


  clearFilters(): void {
    this.searchFilter.setValue('');
    this.roleFilter.setValue('');
  }

  loadUsers(): void {
    try {
      this.users = this.userService.getUsers();
      this.filteredUsers.data = this.users; // Initialize filtered users
    } catch (error) {
      this.errorHandler.showErrorMessage(error, 'Error loading users');
      this.users = [];
      this.filteredUsers.data = [];
    }
  }

  loadRoles(): void {
    try{
    this.roles = this.roleService.getRoles().map(role => role.name);
    } catch (error) {
      this.errorHandler.showErrorMessage(error, 'Error loading roles');
      throw error;
    }
  }

  showAddUserForm(): void {
    this.selectedUser = null;
    this.resetForm();
    this.showForm = true;
  }

  onSave(): void {
    if (this.userForm.valid) {
      try{
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
     // alert('User saved successfully!');
      this.snackBar.open('User saved successfully!', 'Close', { duration: 3000, verticalPosition: 'top' });
      this.loadUsers(); // Reload users from service
      this.applyFilter(); // Reapply filters after loading
      this.showForm = false;
      this.resetForm();
    } catch (error) {
      this.errorHandler.showErrorMessage(error, 'Error saving user data');
      throw error;
    }
    } else {
      this.userForm.markAllAsTouched();
      alert('Please fill all required fields.');
    }
  }

  onUpdate(): void {
    if (this.userForm.valid && this.selectedUser) {
      try{
      this.userService.updateUser(this.selectedUser.id, this.userForm.value);
      console.log('User updated:', this.userForm.value);
      this.snackBar.open('User updated successfully!', 'Close', { duration: 3000,verticalPosition: 'top' });
     // alert('User updated successfully!');
      this.loadUsers(); // Reload users from service
      this.applyFilter(); // Reapply filters after loading
      this.showForm = false;
      this.resetForm();
      this.selectedUser = null;
      }
      catch (error) {
        this.errorHandler.showErrorMessage(error, 'Error updating user data');
        throw error;
      }
    } else {
      this.userForm.markAllAsTouched();
      //alert('Please fill all required fields correctly.');
      this.snackBar.open('Please fill all required fields.', 'Close', { duration: 3000, verticalPosition: 'top' });

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
      //alert('User deleted successfully!');
      this.snackBar.open('User deleted successfully!', 'Close', { duration: 3000, verticalPosition: 'top' });
      this.loadUsers(); // Reload users from service
      this.applyFilter(); // Reapply filters after loading
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
