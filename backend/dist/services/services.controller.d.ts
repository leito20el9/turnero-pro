import { ServicesService } from "./services.service";
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(): Promise<import("./service.entity").ServiceEntity[]>;
    create(body: any): Promise<import("./service.entity").ServiceEntity>;
    update(id: string, body: any): Promise<import("./service.entity").ServiceEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
