import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RoleService, Role } from '../../services/role.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class Roles {
  private roleService = inject(RoleService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  showForm = false;
  roles: Role[] = [];
  displayedColumns: string[] = ['name', 'description', 'permissions', 'actions'];
  selectedRole: Role | null = null;
  currentUser: any;

  roleForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    permissions: new FormControl<string[]>([], { validators: [Validators.required] })
  });

  availablePermissions = [
    { key: 'create', label: 'Create' },
    { key: 'read', label: 'Read' },
    { key: 'update', label: 'Update' },
    { key: 'delete', label: 'Delete' }
  
  ];

  ngOnInit(): void {
    this.loadRoles();
    this.loadCurrentUser();
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

  canCreateRole(): boolean {
    return this.roleService.hasPermission(this.currentUser?.role, 'create');
  }

  canUpdateRole(): boolean {
    return this.roleService.hasPermission(this.currentUser?.role, 'update');
  }

  canDeleteRole(): boolean {
    return this.roleService.hasPermission(this.currentUser?.role, 'delete');
  }

  loadRoles(): void {
    this.roles = this.roleService.getRoles();
  }

  showAddRoleForm(): void {
    this.selectedRole = null;
    this.resetForm();
    this.showForm = true;
  }

  onSave(): void {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      this.roleService.addRole({
        name: formValue.name!,
        description: formValue.description!,
        permissions: formValue.permissions || []
      });
      console.log('Role saved:', this.roleForm.value);
      alert('Role saved successfully!');
      this.loadRoles();
      this.showForm = false;
      this.resetForm();
    } else {
      this.roleForm.markAllAsTouched();
      alert('Please fill all required fields correctly.');
    }
  }

  onUpdate(): void {
    if (this.roleForm.valid && this.selectedRole) {
      const formValue = this.roleForm.value;
      this.roleService.updateRole(this.selectedRole.id, {
        name: formValue.name!,
        description: formValue.description!,
        permissions: formValue.permissions || []
      });
      console.log('Role updated:', this.roleForm.value);
      alert('Role updated successfully!');
      this.loadRoles();
      this.showForm = false;
      this.resetForm();
      this.selectedRole = null;
    } else {
      this.roleForm.markAllAsTouched();
      alert('Please fill all required fields correctly.');
    }
  }

  editRole(role: Role): void {
    this.selectedRole = role;
    this.showForm = true;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
  }

  deleteRole(role: Role): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(role.id);
      console.log('Role deleted:', role);
      alert('Role deleted successfully!');
      this.loadRoles();
    }
  }

  onCancel(): void {
    this.showForm = false;
    this.resetForm();
    this.selectedRole = null;
  }

  resetForm(): void {
    this.roleForm.reset();
  }

  togglePermission(permission: string): void {
    const permissions = this.roleForm.get('permissions')?.value || [];
    const index = permissions.indexOf(permission);
    
    if (index > -1) {
      const updatedPermissions = permissions.filter(p => p !== permission);
      this.roleForm.patchValue({ permissions: updatedPermissions });
    } else {
      this.roleForm.patchValue({ permissions: [...permissions, permission] });
    }
  }

  hasPermission(permission: string): boolean {
    const permissions = this.roleForm.get('permissions')?.value || [];
    return permissions.includes(permission);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
