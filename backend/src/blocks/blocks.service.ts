import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './block.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepo: Repository<Block>,
  ) {}

  async create(data: Partial<Block>) {
    const { date, startTime, endTime } = data;

    if (!date || !startTime || !endTime) {
      throw new BadRequestException('Datos incompletos');
    }
    if (endTime <= startTime) {
      throw new BadRequestException('endTime debe ser mayor que startTime');
    }

    const block = this.blockRepo.create({
      date,
      startTime,
      endTime,
      // ✅ aquí está el fix: nada de null
      reason: data.reason?.trim() || undefined,
    });

    return this.blockRepo.save(block);
  }

  findByDate(date: string) {
    if (!date) throw new BadRequestException('date es requerido');

    return this.blockRepo.find({
      where: { date },
      order: { startTime: 'ASC' },
    });
  }

  findBetween(from: string, to: string) {
    if (!from || !to) throw new BadRequestException('from y to son requeridos');

    return this.blockRepo
      .createQueryBuilder('b')
      .where('b.date BETWEEN :from AND :to', { from, to })
      .orderBy('b.date', 'ASC')
      .addOrderBy('b.startTime', 'ASC')
      .getMany();
  }

  async remove(id: number) {
    const block = await this.blockRepo.findOne({ where: { id } });
    if (!block) throw new NotFoundException('Bloqueo no encontrado');

    await this.blockRepo.delete({ id });
    return { message: 'Bloqueo eliminado' };
  }
}
