import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Block } from '../blocks/block.entity';
import { ServiceEntity } from '../services/service.entity';
import { BusinessHours } from '../hours/business-hours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Block, ServiceEntity, BusinessHours])],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
