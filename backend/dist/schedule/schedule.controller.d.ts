import { ScheduleService } from './schedule.service';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    create(body: any): Promise<import("./schedule.entity").Schedule>;
    findAll(): Promise<import("./schedule.entity").Schedule[]>;
}
