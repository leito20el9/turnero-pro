import { BookingsService } from './bookings.service';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(body: any): Promise<import("./booking.entity").Booking>;
    findByPhone(phone?: string): Promise<import("./booking.entity").Booking[]> | never[];
    cancel(token: string): Promise<import("./booking.entity").Booking>;
    findBetween(from: string, to: string): Promise<import("./booking.entity").Booking[]>;
    setStatus(id: string, body: any): Promise<import("./booking.entity").Booking>;
}
