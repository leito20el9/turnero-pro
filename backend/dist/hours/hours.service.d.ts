import { Repository } from "typeorm";
import { BusinessHours } from "./business-hours.entity";
type HoursDTO = {
    dayOfWeek: number;
    closed: boolean;
    openTime?: string;
    closeTime?: string;
};
export declare class HoursService {
    private repo;
    constructor(repo: Repository<BusinessHours>);
    private defaultWeek;
    getAll(): Promise<BusinessHours[]>;
    upsertAll(payload: HoursDTO[]): Promise<BusinessHours[]>;
}
export {};
