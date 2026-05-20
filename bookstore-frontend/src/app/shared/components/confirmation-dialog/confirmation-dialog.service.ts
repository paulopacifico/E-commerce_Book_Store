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
      width: 'min(29rem, calc(100vw - 2rem))',
      maxWidth: 'calc(100vw - 2rem)',
      disableClose: false,
      role: 'alertdialog',
      ariaModal: true,
      ariaLabelledBy: 'confirmation-dialog-title',
      ariaDescribedBy: 'confirmation-dialog-desc',
      panelClass: 'app-confirmation-dialog-panel',
      backdropClass: 'app-confirmation-dialog-backdrop',
    });
    return ref.afterClosed().pipe(map((result) => result === true));
  }
}
