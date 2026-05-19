import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotFoundComponent],
      imports: [RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
  });

  it('renders a branded recovery state with catalog and home actions', () => {
    const element: HTMLElement = fixture.nativeElement;
    const links = [...element.querySelectorAll('a')].map((link) => ({
      text: link.textContent?.trim(),
      href: link.getAttribute('href'),
    }));

    expect(element.querySelector('.not-found-code')?.textContent).toContain('404');
    expect(element.querySelector('h1')?.textContent).toContain('This page is not in the catalog.');
    expect(links).toEqual([
      { text: 'Browse Books', href: '/books' },
      { text: 'Back Home', href: '/' },
    ]);
  });
});
