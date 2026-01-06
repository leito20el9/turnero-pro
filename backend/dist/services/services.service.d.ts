import { Repository } from "typeorm";
import { ServiceEntity } from "./service.entity";
export declare class ServicesService {
    private readonly repo;
    constructor(repo: Repository<ServiceEntity>);
    findAll(): Promise<ServiceEntity[]>;
    create(data: Partial<ServiceEntity>): Promise<ServiceEntity>;
    update(id: number, data: Partial<ServiceEntity>): Promise<ServiceEntity>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
