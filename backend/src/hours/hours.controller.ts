import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { HoursService } from "./hours.service";

@Controller("hours")
export class HoursController {
  constructor(private readonly hoursService: HoursService) {}

  // ✅ Público (para que /availability lo use después)
  @Get()
  getAll() {
    return this.hoursService.getAll();
  }

  // 🔒 Admin
  @UseGuards(JwtAuthGuard)
  @Put()
  upsertAll(@Body() body: any) {
    return this.hoursService.upsertAll(body);
  }
}
