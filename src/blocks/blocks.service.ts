import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './block.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepo: Repository<Block>,
  ) {}

  create(data: Partial<Block>) {
    const block = this.blockRepo.create(data);
    return this.blockRepo.save(block);
  }

  findByDate(date: string) {
    return this.blockRepo.find({ where: { date } });
  }
}
