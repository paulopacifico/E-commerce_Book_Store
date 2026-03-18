import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollObserverService {
  observe(
    element: HTMLElement,
    onIntersect: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit,
  ): IntersectionObserver {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => onIntersect(entry));
    }, options);

    observer.observe(element);
    return observer;
  }
}
