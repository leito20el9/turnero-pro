import { Controller, Post, Body } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Patch, Param } from '@nestjs/common';


@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() body: any) {
    return this.bookingsService.createBooking(body);
  }
  @Patch(':token/cancel')
cancel(@Param('token') token: string) {
  return this.bookingsService.cancelBooking(token);
}

}

