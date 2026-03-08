import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import type { ConfirmationDialogData } from './confirmation-dialog.data';
import { DEFAULT_CONFIRM_TEXT, DEFAULT_CANCEL_TEXT } from './confirmation-dialog.data';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent, boolean>);
  private readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);

  readonly dialogTitleId = 'confirmation-dialog-title';
  readonly dialogDescId = 'confirmation-dialog-desc';
  readonly title = this.data.title;
  readonly message = this.data.message;
  readonly confirmText = this.data.confirmText ?? DEFAULT_CONFIRM_TEXT;
  readonly cancelText = this.data.cancelText ?? DEFAULT_CANCEL_TEXT;

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
