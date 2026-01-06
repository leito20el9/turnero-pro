import { BlocksService } from './blocks.service';
export declare class BlocksController {
    private readonly blocksService;
    constructor(blocksService: BlocksService);
    findByDate(date: string): Promise<import("./block.entity").Block[]>;
    findBetween(from: string, to: string): Promise<import("./block.entity").Block[]>;
    create(body: any): Promise<import("./block.entity").Block>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
