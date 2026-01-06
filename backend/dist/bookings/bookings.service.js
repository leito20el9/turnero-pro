"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("./booking.entity");
const crypto_1 = require("crypto");
const block_entity_1 = require("../blocks/block.entity");
const service_entity_1 = require("../services/service.entity");
const business_hours_entity_1 = require("../hours/business-hours.entity");
let BookingsService = BookingsService_1 = class BookingsService {
    bookingRepo;
    blockRepo;
    serviceRepo;
    hoursRepo;
    logger = new common_1.Logger(BookingsService_1.name);
    constructor(bookingRepo, blockRepo, serviceRepo, hoursRepo) {
        this.bookingRepo = bookingRepo;
        this.blockRepo = blockRepo;
        this.serviceRepo = serviceRepo;
        this.hoursRepo = hoursRepo;
    }
    async findByPhone(phone) {
        return this.bookingRepo.find({
            where: { phone },
            order: { date: 'ASC', startTime: 'ASC' },
        });
    }
    async findBetween(from, to) {
        if (!from || !to)
            throw new common_1.BadRequestException('Debes enviar from y to');
        return this.bookingRepo
            .createQueryBuilder('b')
            .where('b.date >= :from AND b.date <= :to', { from, to })
            .orderBy('b.date', 'ASC')
            .addOrderBy('b.startTime', 'ASC')
            .getMany();
    }
    async setStatus(id, status) {
        const allowed = ['CONFIRMED', 'CANCELLED', 'NO_SHOW'];
        if (!allowed.includes(status)) {
            throw new common_1.BadRequestException(`Estado inválido. Usa: ${allowed.join(', ')}`);
        }
        const booking = await this.bookingRepo.findOne({ where: { id } });
        if (!booking)
            throw new common_1.BadRequestException('Reserva no encontrada');
        booking.status = status;
        return this.bookingRepo.save(booking);
    }
    async createBooking(data) {
        const { date, time, serviceId, name, phone } = data;
        if (!date || !time || !serviceId || !name || !phone) {
            throw new common_1.BadRequestException('Datos incompletos');
        }
        const startTime = this.toHHmm(time);
        const service = await this.serviceRepo.findOne({ where: { id: Number(serviceId) } });
        if (!service)
            throw new common_1.BadRequestException('Servicio no encontrado');
        const duration = Number(service.duration);
        if (!duration || duration <= 0)
            throw new common_1.BadRequestException('Duración inválida del servicio');
        const endTime = this.addMinutes(startTime, duration);
        const dayOfWeek = this.getDayOfWeekFromYMD(date);
        const hours = await this.hoursRepo.findOne({ where: { dayOfWeek } });
        if (!hours || hours.closed) {
            throw new common_1.BadRequestException('La barbería está cerrada ese día');
        }
        const openTime = this.toHHmm(hours.openTime || '');
        const closeTime = this.toHHmm(hours.closeTime || '');
        if (!openTime || !closeTime)
            throw new common_1.BadRequestException('Horario no configurado');
        if (startTime < openTime || endTime > closeTime) {
            throw new common_1.BadRequestException(`Fuera de horario. Atención: ${openTime} a ${closeTime}`);
        }
        const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;
        const blocks = await this.blockRepo.find({ where: { date } });
        const isBlocked = blocks.some((b) => overlaps(this.toHHmm(b.startTime), this.toHHmm(b.endTime), startTime, endTime));
        if (isBlocked)
            throw new common_1.BadRequestException('Horario no disponible (bloqueado)');
        const conflict = await this.bookingRepo
            .createQueryBuilder('b')
            .where('b.date = :date', { date })
            .andWhere('b.status = :status', { status: 'CONFIRMED' })
            .andWhere('(b.startTime < :endTime AND b.endTime > :startTime)', { startTime, endTime })
            .getOne();
        if (conflict)
            throw new common_1.BadRequestException('Horario no disponible (ocupado)');
        const conflictByClient = await this.bookingRepo
            .createQueryBuilder('b')
            .where('b.date = :date', { date })
            .andWhere('b.phone = :phone', { phone })
            .andWhere('b.status = :status', { status: 'CONFIRMED' })
            .andWhere('(b.startTime < :endTime AND b.endTime > :startTime)', { startTime, endTime })
            .getOne();
        if (conflictByClient) {
            throw new common_1.BadRequestException('Ya tienes una reserva en ese rango horario');
        }
        const booking = this.bookingRepo.create({
            name,
            phone,
            date,
            startTime,
            endTime,
            serviceId: Number(serviceId),
            status: 'CONFIRMED',
            cancelToken: (0, crypto_1.randomUUID)(),
        });
        const saved = await this.bookingRepo.save(booking);
        this.logger.log(`Booking creada id=${saved.id} ${date} ${startTime}-${endTime} phone=${phone}`);
        return saved;
    }
    async cancelBooking(token) {
        const booking = await this.bookingRepo.findOne({ where: { cancelToken: token } });
        if (!booking)
            throw new common_1.BadRequestException('Token inválido');
        booking.status = 'CANCELLED';
        return this.bookingRepo.save(booking);
    }
    toHHmm(t) {
        return (t || '').slice(0, 5);
    }
    addMinutes(start, mins) {
        const [h, m] = start.split(':').map(Number);
        const d = new Date();
        d.setHours(h);
        d.setMinutes(m + mins);
        return `${d.getHours().toString().padStart(2, '0')}:${d
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
    }
    getDayOfWeekFromYMD(ymd) {
        const [y, m, d] = ymd.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        const js = dt.getDay();
        return js === 0 ? 7 : js;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(block_entity_1.Block)),
    __param(2, (0, typeorm_1.InjectRepository)(service_entity_1.ServiceEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(business_hours_entity_1.BusinessHours)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map