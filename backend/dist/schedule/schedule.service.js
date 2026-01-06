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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_entity_1 = require("./schedule.entity");
let ScheduleService = class ScheduleService {
    scheduleRepo;
    constructor(scheduleRepo) {
        this.scheduleRepo = scheduleRepo;
    }
    async createSchedule(data) {
        if (data.dayOfWeek === undefined ||
            data.dayOfWeek < 0 ||
            data.dayOfWeek > 6) {
            throw new common_1.BadRequestException('Día inválido');
        }
        if (!data.startHour || !data.endHour) {
            throw new common_1.BadRequestException('Horario inválido');
        }
        const schedule = this.scheduleRepo.create(data);
        return this.scheduleRepo.save(schedule);
    }
    async getSchedules() {
        return this.scheduleRepo.find({
            order: { dayOfWeek: 'ASC' },
        });
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map