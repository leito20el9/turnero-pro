import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() body: any) {
    return this.scheduleService.createSchedule(body);
  }

  @Get()
  findAll() {
    return this.scheduleService.getSchedules();
  }
}
