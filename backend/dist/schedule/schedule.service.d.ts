import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';
export declare class ScheduleService {
    private scheduleRepo;
    constructor(scheduleRepo: Repository<Schedule>);
    createSchedule(data: Partial<Schedule>): Promise<Schedule>;
    getSchedules(): Promise<Schedule[]>;
}
