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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("../bookings/booking.entity");
const block_entity_1 = require("../blocks/block.entity");
const business_hours_entity_1 = require("../hours/business-hours.entity");
let AvailabilityService = class AvailabilityService {
    bookingRepo;
    blockRepo;
    hoursRepo;
    constructor(bookingRepo, blockRepo, hoursRepo) {
        this.bookingRepo = bookingRepo;
        this.blockRepo = blockRepo;
        this.hoursRepo = hoursRepo;
    }
    async getAvailability(date) {
        if (!date)
            throw new common_1.BadRequestException('Fecha requerida');
        const dayOfWeek = this.getDayOfWeekFromYMD(date);
        const hours = await this.hoursRepo.findOne({ where: { dayOfWeek } });
        if (!hours) {
            return { date, availableSlots: [] };
        }
        if (hours.closed) {
            return { date, availableSlots: [] };
        }
        const openTime = hours.openTime;
        const closeTime = hours.closeTime;
        const slotMinutes = 60;
        const bookings = await this.bookingRepo.find({
            where: { date, status: 'CONFIRMED' },
        });
        const blocks = await this.blockRepo.find({
            where: { date },
            order: { startTime: 'ASC' },
        });
        const addMinutes = (time, mins) => {
            const [h, m] = time.split(':').map(Number);
            const d = new Date();
            d.setHours(h);
            d.setMinutes(m + mins);
            return `${d.getHours().toString().padStart(2, '0')}:${d
                .getMinutes()
                .toString()
                .padStart(2, '0')}`;
        };
        const overlaps = (aStart, aEnd, bStart, bEnd) => {
            return aStart < bEnd && aEnd > bStart;
        };
        const allSlots = [];
        let t = openTime;
        while (true) {
            const end = addMinutes(t, slotMinutes);
            if (end > closeTime)
                break;
            allSlots.push(t);
            t = end;
        }
        const availableSlots = allSlots.filter((slotStart) => {
            const slotEnd = addMinutes(slotStart, slotMinutes);
            const busyByBooking = bookings.some((b) => overlaps(b.startTime, b.endTime, slotStart, slotEnd));
            if (busyByBooking)
                return false;
            const busyByBlock = blocks.some((bl) => overlaps(bl.startTime, bl.endTime, slotStart, slotEnd));
            if (busyByBlock)
                return false;
            return true;
        });
        return { date, availableSlots };
    }
    getDayOfWeekFromYMD(ymd) {
        const [y, m, d] = ymd.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        const js = dt.getDay();
        return js === 0 ? 7 : js;
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(block_entity_1.Block)),
    __param(2, (0, typeorm_1.InjectRepository)(business_hours_entity_1.BusinessHours)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map