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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessHours = void 0;
const typeorm_1 = require("typeorm");
let BusinessHours = class BusinessHours {
    id;
    dayOfWeek;
    closed;
    openTime;
    closeTime;
};
exports.BusinessHours = BusinessHours;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BusinessHours.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", unique: true }),
    __metadata("design:type", Number)
], BusinessHours.prototype, "dayOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], BusinessHours.prototype, "closed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", String)
], BusinessHours.prototype, "openTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", String)
], BusinessHours.prototype, "closeTime", void 0);
exports.BusinessHours = BusinessHours = __decorate([
    (0, typeorm_1.Entity)()
], BusinessHours);
//# sourceMappingURL=business-hours.entity.js.map