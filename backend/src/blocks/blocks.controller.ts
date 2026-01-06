import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  // ✅ Público: bloqueos por fecha (para disponibilidad)
  @Get()
  findByDate(@Query('date') date: string) {
    return this.blocksService.findByDate(date);
  }

  // ✅ Público: bloqueos por rango (para semana)
  @Get('range')
  findBetween(@Query('from') from: string, @Query('to') to: string) {
    return this.blocksService.findBetween(from, to);
  }

  // 🔒 Admin: crear bloqueo
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.blocksService.create(body);
  }

  // 🔒 Admin: eliminar bloqueo
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blocksService.remove(Number(id));
  }
}

