import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import type { ConfirmationDialogData } from './confirmation-dialog.data';

/**
 * Opens the confirmation dialog and returns an Observable that emits true if the user
 * confirmed, false if cancelled or closed (backdrop/ESC). Completes after one emission.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  private readonly dialog = inject(MatDialog);

  open(data: ConfirmationDialogData): Observable<boolean> {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data,
      width: 'min(400px, 90vw)',
      disableClose: false,
      role: 'alertdialog',
      ariaModal: true,
    });
    return ref.afterClosed().pipe(map((result) => result === true));
  }
}
