import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {

  @Post()
  create(@Body() body: any) {
    return {
      message: 'Servicio creado',
      data: body,
    };
  }

  @Get()
  findAll() {
    return [
      { id: 1, name: 'Corte', duration: 30, price: 20 },
    ];
  }
}

