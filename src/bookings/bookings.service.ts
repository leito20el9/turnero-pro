import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
  ) {}

  async createBooking(data: any) {
    const { date, time, serviceId, name, phone } = data;

    // 🔹 VALIDACIONES BÁSICAS
    if (!date || !time || !serviceId) {
      throw new BadRequestException('Datos incompletos');
    }

    // 🔹 Calcular startTime y endTime (simple por ahora)
    const startTime = time;
    const endTime = this.calculateEndTime(time, 60); // 60 min temporal

    // 🔹 Buscar conflicto
    const conflict = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.status = :status', { status: 'CONFIRMED' })
      .andWhere(
        '(b.startTime < :endTime AND b.endTime > :startTime)',
        { startTime, endTime },
      )
      .getOne();

    if (conflict) {
      throw new BadRequestException('Horario no disponible');
    }

    // 🔹 Crear reserva
    const booking = this.bookingRepo.create({
      name,
      phone,
      date,
      startTime,
      endTime,
      serviceId,
      status: 'CONFIRMED',
      cancelToken: randomUUID(),
    });

    return this.bookingRepo.save(booking);
  }

  async cancelBooking(token: string) {
    const booking = await this.bookingRepo.findOne({
      where: { cancelToken: token },
    });

    if (!booking) {
      throw new BadRequestException('Token inválido');
    }

    booking.status = 'CANCELLED';
    return this.bookingRepo.save(booking);
  }

  // 🔹 Función auxiliar
  private calculateEndTime(start: string, duration: number): string {
    const [h, m] = start.split(':').map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + duration);

    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }
}


