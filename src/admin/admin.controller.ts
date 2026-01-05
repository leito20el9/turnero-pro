import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('admin')
export class AdminController {

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboard() {
    return {
      message: 'Solo admins autenticados pueden ver esto',
    };
  }
}
