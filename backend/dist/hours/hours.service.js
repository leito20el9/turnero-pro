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
exports.HoursService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_hours_entity_1 = require("./business-hours.entity");
let HoursService = class HoursService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    defaultWeek() {
        return [
            { dayOfWeek: 1, closed: false, openTime: "09:00", closeTime: "18:00" },
            { dayOfWeek: 2, closed: false, openTime: "09:00", closeTime: "18:00" },
            { dayOfWeek: 3, closed: false, openTime: "09:00", closeTime: "18:00" },
            { dayOfWeek: 4, closed: false, openTime: "09:00", closeTime: "18:00" },
            { dayOfWeek: 5, closed: false, openTime: "09:00", closeTime: "18:00" },
            { dayOfWeek: 6, closed: false, openTime: "09:00", closeTime: "13:00" },
            { dayOfWeek: 7, closed: true },
        ];
    }
    async getAll() {
        const items = await this.repo.find({ order: { dayOfWeek: "ASC" } });
        if (items.length === 0) {
            await this.repo.save(this.defaultWeek().map((x) => this.repo.create(x)));
            return this.repo.find({ order: { dayOfWeek: "ASC" } });
        }
        return items;
    }
    async upsertAll(payload) {
        if (!Array.isArray(payload) || payload.length !== 7) {
            throw new common_1.BadRequestException("Debes enviar 7 días (1..7).");
        }
        for (const h of payload) {
            if (h.dayOfWeek < 1 || h.dayOfWeek > 7) {
                throw new common_1.BadRequestException("dayOfWeek debe ser 1..7");
            }
            if (!h.closed) {
                if (!h.openTime || !h.closeTime) {
                    throw new common_1.BadRequestException("openTime y closeTime son requeridos si no está cerrado.");
                }
                if (h.closeTime <= h.openTime) {
                    throw new common_1.BadRequestException("closeTime debe ser mayor que openTime.");
                }
            }
        }
        for (const h of payload) {
            const existing = await this.repo.findOne({ where: { dayOfWeek: h.dayOfWeek } });
            if (!existing) {
                await this.repo.save(this.repo.create(h));
            }
            else {
                existing.closed = h.closed;
                existing.openTime = h.closed ? undefined : h.openTime;
                existing.closeTime = h.closed ? undefined : h.closeTime;
                await this.repo.save(existing);
            }
        }
        return this.getAll();
    }
};
exports.HoursService = HoursService;
exports.HoursService = HoursService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_hours_entity_1.BusinessHours)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HoursService);
//# sourceMappingURL=hours.service.js.map