import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private rolesKey = 'rbac_roles';
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDefaultRoles();
    }
  }

  private initializeDefaultRoles(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Check if roles already exist in localStorage
    if (!localStorage.getItem(this.rolesKey)) {
      const defaultRoles: Role[] = [
        {
          id: 1,
          name: 'Admin',
          description: 'Full system access with all permissions',
          permissions: ['create', 'read', 'update', 'delete']
        }
      ];
      localStorage.setItem(this.rolesKey, JSON.stringify(defaultRoles));
    }
  }

  getRoles(): Role[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    const rolesJson = localStorage.getItem(this.rolesKey);
    if (rolesJson) {
      return JSON.parse(rolesJson);
    }
    return [];
  }

  addRole(role: Omit<Role, 'id'>): Role {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Cannot add role on server side');
    }
    
    const roles = this.getRoles();
    const newRole: Role = {
      ...role,
      id: Date.now()
    };
    roles.push(newRole);
    localStorage.setItem(this.rolesKey, JSON.stringify(roles));
    return newRole;
  }

  updateRole(id: number, roleData: Partial<Role>): Role | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    const roles = this.getRoles();
    const index = roles.findIndex(role => role.id === id);
    
    if (index !== -1) {
      roles[index] = { ...roles[index], ...roleData };
      localStorage.setItem(this.rolesKey, JSON.stringify(roles));
      return roles[index];
    }
    return null;
  }

  deleteRole(id: number): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const roles = this.getRoles();
    const filteredRoles = roles.filter(role => role.id !== id);
    
    if (filteredRoles.length < roles.length) {
      localStorage.setItem(this.rolesKey, JSON.stringify(filteredRoles));
      return true;
    }
    return false;
  }

 
  getRoleByName(name: string): Role | undefined {
    const roles = this.getRoles();
    return roles.find(role => role.name === name);
  }

  hasPermission(roleName: string, permission: string): boolean {
    const role = this.getRoleByName(roleName);
    return role ? role.permissions.includes(permission) : false;
  }
}
