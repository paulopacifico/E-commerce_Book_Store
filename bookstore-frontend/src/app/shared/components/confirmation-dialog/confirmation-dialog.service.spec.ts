import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { ConfirmationDialogService } from './confirmation-dialog.service';

describe('ConfirmationDialogService', () => {
  let service: ConfirmationDialogService;
  let openMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    openMock = vi.fn().mockReturnValue({ afterClosed: () => of(undefined) });

    TestBed.configureTestingModule({
      providers: [
        ConfirmationDialogService,
        {
          provide: MatDialog,
          useValue: { open: openMock },
        },
      ],
    });

    service = TestBed.inject(ConfirmationDialogService);
  });

  it('opens the app dialog with branded overlay configuration', () => {
    service
      .open({
        title: 'Remove Item',
        message: 'Remove this item?',
        confirmText: 'Remove',
        tone: 'danger',
      })
      .subscribe();

    expect(openMock).toHaveBeenCalledWith(ConfirmationDialogComponent, {
      data: {
        title: 'Remove Item',
        message: 'Remove this item?',
        confirmText: 'Remove',
        tone: 'danger',
      },
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
  });

  it('maps dialog close values to a boolean confirmation result', () => {
    openMock.mockReturnValueOnce({ afterClosed: () => of(true) });

    service.open({ title: 'Confirm', message: 'Continue?' }).subscribe((confirmed) => {
      expect(confirmed).toBe(true);
    });

    openMock.mockReturnValueOnce({ afterClosed: () => of(undefined) });

    service.open({ title: 'Confirm', message: 'Continue?' }).subscribe((confirmed) => {
      expect(confirmed).toBe(false);
    });
  });
});
