export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const DEFAULT_CONFIRM_TEXT = 'Confirm';
export const DEFAULT_CANCEL_TEXT = 'Cancel';
