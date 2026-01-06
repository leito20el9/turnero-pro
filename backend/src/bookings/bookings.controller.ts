import { Controller, Post, Body, Patch, Param, Get, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ✅ Público: crear reserva
  @Post()
  create(@Body() body: any) {
    return this.bookingsService.createBooking(body);
  }

  // ✅ Público: listar reservas por celular
  @Get()
  findByPhone(@Query('phone') phone?: string) {
    if (!phone) return [];
    return this.bookingsService.findByPhone(phone);
  }

  // ✅ Público: cancelar por token
  @Patch(':token/cancel')
  cancel(@Param('token') token: string) {
    return this.bookingsService.cancelBooking(token);
  }

  // 🔒 Admin: listar entre fechas (dashboard)
  @Get('admin')
  findBetween(@Query('from') from: string, @Query('to') to: string) {
    return this.bookingsService.findBetween(from, to);
  }

  // 🔒 Admin: cambiar estado
  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() body: any) {
    return this.bookingsService.setStatus(Number(id), body.status);
  }
}
