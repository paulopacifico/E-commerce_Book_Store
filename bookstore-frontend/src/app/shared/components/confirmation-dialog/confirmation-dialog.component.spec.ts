import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import type { ConfirmationDialogData } from './confirmation-dialog.data';

describe('ConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let closeMock: ReturnType<typeof vi.fn>;

  async function render(data: ConfirmationDialogData): Promise<void> {
    closeMock = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: closeMock } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    fixture.detectChanges();
  }

  it('renders the provided copy and default action labels', async () => {
    await render({
      title: 'Leave checkout?',
      message: 'Your delivery details have not been submitted yet.',
    });

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.dialog-title')?.textContent).toContain('Leave checkout?');
    expect(element.querySelector('.dialog-message')?.textContent).toContain(
      'Your delivery details have not been submitted yet.',
    );
    expect(element.querySelector('.dialog-button-confirm')?.textContent).toContain('Confirm');
    expect(element.querySelector('.dialog-button-cancel')?.textContent).toContain('Cancel');
    expect(element.querySelector('.confirmation-dialog-danger')).toBeNull();
  });

  it('marks destructive confirmations with the danger tone', async () => {
    await render({
      title: 'Remove Item',
      message: 'Remove "Clean Architecture" from your cart?',
      confirmText: 'Remove',
      cancelText: 'Keep Item',
      tone: 'danger',
    });

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.confirmation-dialog-danger')).not.toBeNull();
    expect(element.querySelector('.dialog-button-danger')?.textContent).toContain('Remove');
    expect(element.textContent).toContain('Confirm removal');
  });

  it('closes with true when confirmed and false when cancelled', async () => {
    await render({
      title: 'Remove Item',
      message: 'Remove this item?',
      tone: 'danger',
    });

    const element: HTMLElement = fixture.nativeElement;

    (element.querySelector('.dialog-button-confirm') as HTMLButtonElement).click();
    expect(closeMock).toHaveBeenCalledWith(true);

    (element.querySelector('.dialog-button-cancel') as HTMLButtonElement).click();
    expect(closeMock).toHaveBeenCalledWith(false);
  });
});
