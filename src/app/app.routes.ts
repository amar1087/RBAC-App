import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Login } from './pages/login/login';
import { Roles } from './pages/roles/roles';
import { Dashboard } from './pages/dashboard/dashboard';    
import { Users } from './pages/users/users';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'roles', component: Roles, canActivate: [authGuard] },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'users', component: Users, canActivate: [authGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
