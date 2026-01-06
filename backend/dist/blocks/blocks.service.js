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
exports.BlocksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const block_entity_1 = require("./block.entity");
let BlocksService = class BlocksService {
    blockRepo;
    constructor(blockRepo) {
        this.blockRepo = blockRepo;
    }
    async create(data) {
        const { date, startTime, endTime } = data;
        if (!date || !startTime || !endTime) {
            throw new common_1.BadRequestException('Datos incompletos');
        }
        if (endTime <= startTime) {
            throw new common_1.BadRequestException('endTime debe ser mayor que startTime');
        }
        const block = this.blockRepo.create({
            date,
            startTime,
            endTime,
            reason: data.reason?.trim() || undefined,
        });
        return this.blockRepo.save(block);
    }
    findByDate(date) {
        if (!date)
            throw new common_1.BadRequestException('date es requerido');
        return this.blockRepo.find({
            where: { date },
            order: { startTime: 'ASC' },
        });
    }
    findBetween(from, to) {
        if (!from || !to)
            throw new common_1.BadRequestException('from y to son requeridos');
        return this.blockRepo
            .createQueryBuilder('b')
            .where('b.date BETWEEN :from AND :to', { from, to })
            .orderBy('b.date', 'ASC')
            .addOrderBy('b.startTime', 'ASC')
            .getMany();
    }
    async remove(id) {
        const block = await this.blockRepo.findOne({ where: { id } });
        if (!block)
            throw new common_1.NotFoundException('Bloqueo no encontrado');
        await this.blockRepo.delete({ id });
        return { message: 'Bloqueo eliminado' };
    }
};
exports.BlocksService = BlocksService;
exports.BlocksService = BlocksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(block_entity_1.Block)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BlocksService);
//# sourceMappingURL=blocks.service.js.map