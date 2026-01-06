import { AvailabilityService } from './availability.service';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    getAvailability(date: string): Promise<{
        date: string;
        availableSlots: string[];
    }>;
}
