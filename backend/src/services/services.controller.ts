import { Controller, Get, Post, Body, UseGuards, Put, Param, Delete } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { ServicesService } from "./services.service";

@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ✅ Público
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  // 🔒 Admin
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.servicesService.create(body);
  }

  // 🔒 Admin
  @UseGuards(JwtAuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.servicesService.update(Number(id), body);
  }

  // 🔒 Admin
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.servicesService.remove(Number(id));
  }
}
