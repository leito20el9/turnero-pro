import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
  ) {}

  async createSchedule(data: Partial<Schedule>) {
  if (
    data.dayOfWeek === undefined ||
    data.dayOfWeek < 0 ||
    data.dayOfWeek > 6
  ) {
    throw new BadRequestException('Día inválido');
  }

  if (!data.startHour || !data.endHour) {
    throw new BadRequestException('Horario inválido');
  }

  const schedule = this.scheduleRepo.create(data);
  return this.scheduleRepo.save(schedule);
}


  async getSchedules() {
    return this.scheduleRepo.find({
      order: { dayOfWeek: 'ASC' },
    });
  }
}

