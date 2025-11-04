import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  dateOfBirth: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersKey = 'rbac_users';
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDefaultUsers();
    }
  }

  private initializeDefaultUsers(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Check if users already exist in localStorage
    if (!localStorage.getItem(this.usersKey)) {
      const defaultUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          phone: '1234567890',
          role: 'Admin',
          dateOfBirth: new Date('1990-01-01')
        },
        {
          id: 2,
          username: 'manas',
          password: 'manas123',
          firstName: 'Manas',
          lastName: 'Mehrotra',
          email: 'manas.mehrotra@example.com',
          phone: '9876543210',
          role: 'Manager',
          dateOfBirth: new Date('1985-05-15')
        }
      ];
      localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
    }
  }

  getUsers(): User[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    const usersJson = localStorage.getItem(this.usersKey);
    if (usersJson) {
      const users = JSON.parse(usersJson);
      // Convert dateOfBirth strings back to Date objects
      return users.map((user: any) => ({
        ...user,
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null
      }));
    }
    return [];
  }

  getUserById(id: number): User | undefined {
    const users = this.getUsers();
    return users.find(user => user.id === id);
  }

  addUser(user: Omit<User, 'id'>): User {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Cannot add user on server side');
    }
    
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: Date.now()
    };
    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return newUser;
  }

  updateUser(id: number, userData: Partial<User>): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      return users[index];
    }
    return null;
  }

  deleteUser(id: number): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const users = this.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length < users.length) {
      localStorage.setItem(this.usersKey, JSON.stringify(filteredUsers));
      return true;
    }
    return false;
  }

  clearAllUsers(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.usersKey);
  }

  authenticate(username: string, password: string): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  }

  getUserByUsername(username: string): User | undefined {
    const users = this.getUsers();
    return users.find(user => user.username === username);
  }
}
