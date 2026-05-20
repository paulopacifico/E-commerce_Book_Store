export type ConfirmationDialogTone = 'default' | 'danger';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmationDialogTone;
}

export const DEFAULT_CONFIRM_TEXT = 'Confirm';
export const DEFAULT_CANCEL_TEXT = 'Cancel';
