import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task-status.emun';

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatuses = [
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ];

  transform(value: any) {
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`"${value}" is a invalid status`);
    }
    return value;
  }

  // verify is Status write exists
  private isStatusValid(status: any) {
    const index = this.allowedStatuses.indexOf(status);
    return index != -1;
  }
}
