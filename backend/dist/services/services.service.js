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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_entity_1 = require("./service.entity");
let ServicesService = class ServicesService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    findAll() {
        return this.repo.find({ order: { id: "ASC" } });
    }
    create(data) {
        const service = this.repo.create({
            name: (data.name || "").trim(),
            duration: Number(data.duration),
            price: data.price === undefined || data.price === null ? null : Number(data.price),
        });
        return this.repo.save(service);
    }
    async update(id, data) {
        const service = await this.repo.findOne({ where: { id } });
        if (!service)
            throw new common_1.NotFoundException("Servicio no encontrado");
        service.name = (data.name ?? service.name).trim();
        service.duration = data.duration !== undefined ? Number(data.duration) : service.duration;
        service.price = data.price !== undefined ? Number(data.price) : service.price;
        return this.repo.save(service);
    }
    async remove(id) {
        const service = await this.repo.findOne({ where: { id } });
        if (!service)
            throw new common_1.NotFoundException("Servicio no encontrado");
        await this.repo.delete({ id });
        return { message: "Servicio eliminado" };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_entity_1.ServiceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ServicesService);
//# sourceMappingURL=services.service.js.map