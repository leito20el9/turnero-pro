import { Repository } from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { Block } from '../blocks/block.entity';
import { BusinessHours } from '../hours/business-hours.entity';
export declare class AvailabilityService {
    private bookingRepo;
    private blockRepo;
    private hoursRepo;
    constructor(bookingRepo: Repository<Booking>, blockRepo: Repository<Block>, hoursRepo: Repository<BusinessHours>);
    getAvailability(date: string): Promise<{
        date: string;
        availableSlots: string[];
    }>;
    private getDayOfWeekFromYMD;
}
