import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { randomUUID } from 'crypto';
import { Block } from '../blocks/block.entity';
import { ServiceEntity } from '../services/service.entity';
import { BusinessHours } from '../hours/business-hours.entity';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,

    @InjectRepository(Block)
    private blockRepo: Repository<Block>,

    @InjectRepository(ServiceEntity)
    private serviceRepo: Repository<ServiceEntity>,

    @InjectRepository(BusinessHours)
    private hoursRepo: Repository<BusinessHours>,
  ) {}

  // ✅ Público
  async findByPhone(phone: string) {
    return this.bookingRepo.find({
      where: { phone },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  // 🔒 Admin (Dashboard)
  async findBetween(from: string, to: string) {
    if (!from || !to) throw new BadRequestException('Debes enviar from y to');

    return this.bookingRepo
      .createQueryBuilder('b')
      .where('b.date >= :from AND b.date <= :to', { from, to })
      .orderBy('b.date', 'ASC')
      .addOrderBy('b.startTime', 'ASC')
      .getMany();
  }

  // 🔒 Admin (Estados)
  async setStatus(id: number, status: string) {
    const allowed = ['CONFIRMED', 'CANCELLED', 'NO_SHOW'];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Estado inválido. Usa: ${allowed.join(', ')}`);
    }

    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new BadRequestException('Reserva no encontrada');

    booking.status = status;
    return this.bookingRepo.save(booking);
  }

  // ✅ Público: crear reserva (con todas las reglas)
  async createBooking(data: any) {
    const { date, time, serviceId, name, phone } = data;

    if (!date || !time || !serviceId || !name || !phone) {
      throw new BadRequestException('Datos incompletos');
    }

    const startTime = this.toHHmm(time);

    // 1) Duración real del servicio
    const service = await this.serviceRepo.findOne({ where: { id: Number(serviceId) } });
    if (!service) throw new BadRequestException('Servicio no encontrado');

    const duration = Number(service.duration);
    if (!duration || duration <= 0) throw new BadRequestException('Duración inválida del servicio');

    const endTime = this.addMinutes(startTime, duration);

    // 2) Solo dentro del horario de atención
    const dayOfWeek = this.getDayOfWeekFromYMD(date); // 1..7
    const hours = await this.hoursRepo.findOne({ where: { dayOfWeek } });

    if (!hours || hours.closed) {
      throw new BadRequestException('La barbería está cerrada ese día');
    }

    const openTime = this.toHHmm(hours.openTime || '');
    const closeTime = this.toHHmm(hours.closeTime || '');
    if (!openTime || !closeTime) throw new BadRequestException('Horario no configurado');

    if (startTime < openTime || endTime > closeTime) {
      throw new BadRequestException(`Fuera de horario. Atención: ${openTime} a ${closeTime}`);
    }

    const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
      aStart < bEnd && aEnd > bStart;

    // 3) No reservar si está bloqueado
    const blocks = await this.blockRepo.find({ where: { date } });
    const isBlocked = blocks.some((b) =>
      overlaps(this.toHHmm(b.startTime), this.toHHmm(b.endTime), startTime, endTime),
    );
    if (isBlocked) throw new BadRequestException('Horario no disponible (bloqueado)');

    // 4) No reservar si está ocupado (IMPORTANTE: filtra por date)
    const conflict = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.date = :date', { date })
      .andWhere('b.status = :status', { status: 'CONFIRMED' })
      .andWhere('(b.startTime < :endTime AND b.endTime > :startTime)', { startTime, endTime })
      .getOne();

    if (conflict) throw new BadRequestException('Horario no disponible (ocupado)');

    // 5) Un cliente no puede reservar 2 turnos que se crucen
    const conflictByClient = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.date = :date', { date })
      .andWhere('b.phone = :phone', { phone })
      .andWhere('b.status = :status', { status: 'CONFIRMED' })
      .andWhere('(b.startTime < :endTime AND b.endTime > :startTime)', { startTime, endTime })
      .getOne();

    if (conflictByClient) {
      throw new BadRequestException('Ya tienes una reserva en ese rango horario');
    }

    // 6) Crear
    const booking = this.bookingRepo.create({
      name,
      phone,
      date,
      startTime,
      endTime,
      serviceId: Number(serviceId),
      status: 'CONFIRMED',
      cancelToken: randomUUID(),
    });

    const saved = await this.bookingRepo.save(booking);
    this.logger.log(`Booking creada id=${saved.id} ${date} ${startTime}-${endTime} phone=${phone}`);
    return saved;
  }

  // ✅ Público: cancelar reserva
  async cancelBooking(token: string) {
    const booking = await this.bookingRepo.findOne({ where: { cancelToken: token } });
    if (!booking) throw new BadRequestException('Token inválido');

    booking.status = 'CANCELLED';
    return this.bookingRepo.save(booking);
  }

  // ---------- Helpers ----------
  private toHHmm(t: string) {
    return (t || '').slice(0, 5);
  }

  private addMinutes(start: string, mins: number): string {
    const [h, m] = start.split(':').map(Number);
    const d = new Date();
    d.setHours(h);
    d.setMinutes(m + mins);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  private getDayOfWeekFromYMD(ymd: string) {
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const js = dt.getDay(); // 0=Dom
    return js === 0 ? 7 : js; // 1..7
  }
}
