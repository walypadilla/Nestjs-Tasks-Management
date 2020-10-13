import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskStatus } from './task-status.emun';
import { User } from '../auth/user.entity';

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;

  @ManyToOne(
    type => User,
    user => user.tasks,
    { eager: false },
  )
  user: User;

  @Column()
  userId: number;
}
