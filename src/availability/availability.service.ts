import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/booking.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
  ) {}

  async getAvailability(date: string) {
    if (!date) {
      throw new BadRequestException('Fecha requerida');
    }

    // 1️⃣ Horario fijo (fase 1)
    const startHour = 9;
    const endHour = 18;

    const allSlots: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      allSlots.push(`${h.toString().padStart(2, '0')}:00`);
    }

    // 2️⃣ Buscar reservas confirmadas de ese día
    const bookings = await this.bookingRepo.find({
      where: {
        date,
        status: 'CONFIRMED',
      },
    });

    const reservedTimes = bookings.map(b => b.startTime);

    // 3️⃣ Quitar horarios ocupados
    const availableSlots = allSlots.filter(
      slot => !reservedTimes.includes(slot),
    );

    return {
      date,
      availableSlots,
    };
  }
}
