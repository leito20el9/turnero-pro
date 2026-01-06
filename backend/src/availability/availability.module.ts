import { Module } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/booking.entity';
import { Block } from '../blocks/block.entity';
import { BusinessHours } from '../hours/business-hours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Block, BusinessHours])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
