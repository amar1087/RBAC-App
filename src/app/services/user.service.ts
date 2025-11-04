import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ErrorHandlerService } from './error-handler.service';

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
  private errorHandler = inject(ErrorHandlerService);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try{
        this.initializeDefaultUsers();
      } catch (error) {
        this.errorHandler.showErrorMessage(error, 'Error initializing default data for users');
      }
    }
  }

  private initializeDefaultUsers(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Check if users already exist in localStorage
    try{
    if (!localStorage.getItem(this.usersKey)) {
      const defaultUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          password: 'admin@123',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          phone: '1234567890',
          role: 'Admin',
          dateOfBirth: new Date('1990-01-01')
        }
      ];
      localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
    }
    } catch (error) {
      this.errorHandler.showErrorMessage(error, 'Error getting users information');
    }
  }

  getUsers(): User[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try{
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
   catch (error) {
    this.errorHandler.showErrorMessage(error, 'Error getting users information');
    return [];
  }
  }


  addUser(user: Omit<User, 'id'>): User {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Cannot add user on server side');
    }
    try{
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: Date.now()
    };
    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return newUser;
  }catch (error) {
    this.errorHandler.showErrorMessage(error, 'Error adding user');
    throw error;
  }
  }

  updateUser(id: number, userData: Partial<User>): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try{
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      return users[index];
    }
    return null;
  }catch (error) {
    this.errorHandler.showErrorMessage(error, 'Error updating user');
    throw error;
  }
  }

  deleteUser(id: number): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try{
    const users = this.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length < users.length) {
      localStorage.setItem(this.usersKey, JSON.stringify(filteredUsers));
      return true;
    }
    return false;
  }
  catch (error) {
    this.errorHandler.showErrorMessage(error, 'Error deleting user');
    throw error;
  }
  }

  authenticate(username: string, password: string): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try{
      const users = this.getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      return user || null;
    }
    catch (error) {
      this.errorHandler.showErrorMessage(error, 'Error authenticating user credentials');
      throw error;
    }
  }
  }
