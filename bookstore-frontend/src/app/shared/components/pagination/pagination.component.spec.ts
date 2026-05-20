import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;
  let emittedPages: number[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    emittedPages = [];
    component.pageChange.subscribe((page) => emittedPages.push(page));
  });

  function setInputs(currentPage: number, totalPages: number): void {
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.detectChanges();
  }

  function buttonByLabel(label: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(`[aria-label="${label}"]`) as HTMLButtonElement;
  }

  it('does not render pagination controls for a single page', () => {
    setInputs(0, 1);

    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('renders the current range, ellipses and accessible page labels', () => {
    setInputs(2, 10);

    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Page 3 of 10');
    expect(buttonByLabel('Go to first page')).not.toBeNull();
    expect(buttonByLabel('Go to previous page')).not.toBeNull();
    expect(buttonByLabel('Go to next page')).not.toBeNull();
    expect(buttonByLabel('Go to last page')).not.toBeNull();
    expect(buttonByLabel('Current page, page 3').getAttribute('aria-current')).toBe('page');
    expect(element.querySelectorAll('.page-ellipsis')).toHaveLength(1);
  });

  it('emits page changes from boundary and numbered controls', () => {
    setInputs(2, 10);

    buttonByLabel('Go to first page').click();
    buttonByLabel('Go to previous page').click();
    buttonByLabel('Go to next page').click();
    buttonByLabel('Go to last page').click();
    buttonByLabel('Go to page 4').click();
    buttonByLabel('Current page, page 3').click();

    expect(emittedPages).toEqual([0, 1, 3, 9, 3]);
  });
});
