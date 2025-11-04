import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
    
    // Check if user is logged in (only on browser)
    if (isPlatformBrowser(platformId)) {
        const currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
            return true;
        }
    }
    
    router.navigate(['/login']);
    return false;
}