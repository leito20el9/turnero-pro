import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  create(@Body() body: any) {
    return this.blocksService.create(body);
  }

  @Get()
  findByDate(@Query('date') date: string) {
    return this.blocksService.findByDate(date);
  }
}
