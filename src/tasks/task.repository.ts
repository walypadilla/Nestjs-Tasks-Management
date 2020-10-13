import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './DTO/create-task.dto';
import { TaskStatus } from './task-status.emun';
import { GetTaskFilterDto } from './DTO/get-tasks-filter.dto';
import { User } from 'src/auth/user.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');

  // get all task
  async getTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');

    query.where('task.userId = :userId', { userId: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      const task = query.getMany();
      return task;
    } catch (err) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.username
        }", Filters: ${JSON.stringify(filterDto)}`,
        err.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  // create a new task
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = new Task();
    // task variable
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;

    try {
      // create a new task
      await task.save();
    } catch (err) {
      this.logger.error(
        `Failed to create a task for user "${
          user.username
        }", Data: ${JSON.stringify(createTaskDto)}`,
        err.stack,
      );
      throw new InternalServerErrorException();
    }

    delete task.user;

    return task;
  }
}
