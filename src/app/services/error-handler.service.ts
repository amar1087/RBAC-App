import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  showErrorMessage(error:any, message: string): void {
    console.log(error);
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      message = error.message;
    }
    this.snackBar.open(message, 'Close', { duration: 3000, verticalPosition: 'top' });
  }

  showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, verticalPosition: 'top' });
  }

  showWarningMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, verticalPosition: 'top', panelClass: 'warning-snackbar' });
  }

}
