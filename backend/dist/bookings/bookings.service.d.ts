import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { Block } from '../blocks/block.entity';
import { ServiceEntity } from '../services/service.entity';
import { BusinessHours } from '../hours/business-hours.entity';
export declare class BookingsService {
    private bookingRepo;
    private blockRepo;
    private serviceRepo;
    private hoursRepo;
    private readonly logger;
    constructor(bookingRepo: Repository<Booking>, blockRepo: Repository<Block>, serviceRepo: Repository<ServiceEntity>, hoursRepo: Repository<BusinessHours>);
    findByPhone(phone: string): Promise<Booking[]>;
    findBetween(from: string, to: string): Promise<Booking[]>;
    setStatus(id: number, status: string): Promise<Booking>;
    createBooking(data: any): Promise<Booking>;
    cancelBooking(token: string): Promise<Booking>;
    private toHHmm;
    private addMinutes;
    private getDayOfWeekFromYMD;
}
