import { Pipe, PipeTransform } from '@angular/core';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

@Pipe({ name: 'statusIndex', standalone: true, pure: true })
export class StatusIndexPipe implements PipeTransform {
  transform(status: string): number {
    const i = STATUS_STEPS.indexOf(status);
    return i >= 0 ? i : -1;
  }
}
