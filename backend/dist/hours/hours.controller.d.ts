import { HoursService } from "./hours.service";
export declare class HoursController {
    private readonly hoursService;
    constructor(hoursService: HoursService);
    getAll(): Promise<import("./business-hours.entity").BusinessHours[]>;
    upsertAll(body: any): Promise<import("./business-hours.entity").BusinessHours[]>;
}
