import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './DTO/create-task.dto';
import { GetTaskFilterDto } from './DTO/get-tasks-filter.dto';
import { TaskStatus } from './task-status.emun';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}
  // GET all tasks
  getTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }

  // // GET a task by ID
  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });

    // if id doest not exists
    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not-found`);
    }

    return found;
  }

  //create a new task
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // return method create repository task
    return this.taskRepository.createTask(createTaskDto, user);
  }

  // DELETE a task
  async deleteTaskById(id: number, user: User): Promise<void> {
    const result = await this.taskRepository.delete({ id, userId: user.id });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not-found`);
    }
  }

  // UPDATE task status
  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    // save update status task
    await task.save();
    return task;
  }
}
