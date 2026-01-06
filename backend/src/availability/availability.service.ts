import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { Block } from '../blocks/block.entity';
import { BusinessHours } from '../hours/business-hours.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,

    @InjectRepository(Block)
    private blockRepo: Repository<Block>,

    @InjectRepository(BusinessHours)
    private hoursRepo: Repository<BusinessHours>,
  ) {}

  async getAvailability(date: string) {
    if (!date) throw new BadRequestException('Fecha requerida');

    // 1) calcular dayOfWeek (1=Lun ... 7=Dom)
    const dayOfWeek = this.getDayOfWeekFromYMD(date);

    // 2) traer horario del día
    const hours = await this.hoursRepo.findOne({ where: { dayOfWeek } });
    if (!hours) {
      // si por alguna razón no existe, mejor devolver vacío
      return { date, availableSlots: [] };
    }

    if (hours.closed) {
      return { date, availableSlots: [] };
    }

    const openTime = hours.openTime!;
    const closeTime = hours.closeTime!;

    // 3) configuración slots (por ahora 60 min)
    const slotMinutes = 60;

    // 4) traer reservas confirmadas y bloqueos del día
    const bookings = await this.bookingRepo.find({
      where: { date, status: 'CONFIRMED' },
    });

    const blocks = await this.blockRepo.find({
      where: { date },
      order: { startTime: 'ASC' },
    });

    // helpers
    const addMinutes = (time: string, mins: number) => {
      const [h, m] = time.split(':').map(Number);
      const d = new Date();
      d.setHours(h);
      d.setMinutes(m + mins);
      return `${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    };

    const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
      return aStart < bEnd && aEnd > bStart;
    };

    // 5) generar slots desde openTime hasta closeTime
    const allSlots: string[] = [];
    let t = openTime;

    while (true) {
      const end = addMinutes(t, slotMinutes);
      // si el slot se pasa del cierre, cortamos
      if (end > closeTime) break;

      allSlots.push(t);
      t = end;
    }

    // 6) filtrar por reservas + bloqueos
    const availableSlots = allSlots.filter((slotStart) => {
      const slotEnd = addMinutes(slotStart, slotMinutes);

      const busyByBooking = bookings.some((b) =>
        overlaps(b.startTime, b.endTime, slotStart, slotEnd),
      );
      if (busyByBooking) return false;

      const busyByBlock = blocks.some((bl) =>
        overlaps(bl.startTime, bl.endTime, slotStart, slotEnd),
      );
      if (busyByBlock) return false;

      return true;
    });

    return { date, availableSlots };
  }

  private getDayOfWeekFromYMD(ymd: string) {
    // ymd = "YYYY-MM-DD"
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const js = dt.getDay(); // 0=Dom,1=Lun,...6=Sab
    return js === 0 ? 7 : js; // 1..7 (Dom=7)
  }
}
