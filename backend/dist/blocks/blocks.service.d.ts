import { Repository } from 'typeorm';
import { Block } from './block.entity';
export declare class BlocksService {
    private blockRepo;
    constructor(blockRepo: Repository<Block>);
    create(data: Partial<Block>): Promise<Block>;
    findByDate(date: string): Promise<Block[]>;
    findBetween(from: string, to: string): Promise<Block[]>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
