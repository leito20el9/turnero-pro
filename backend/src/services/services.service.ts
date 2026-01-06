import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ServiceEntity } from "./service.entity";

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly repo: Repository<ServiceEntity>,
  ) {}

  findAll() {
    return this.repo.find({ order: { id: "ASC" } });
  }

  create(data: Partial<ServiceEntity>) {
    const service = this.repo.create({
      name: (data.name || "").trim(),
      duration: Number(data.duration),
      price: data.price === undefined || data.price === null ? null : Number(data.price),
    });
    return this.repo.save(service);
  }

  async update(id: number, data: Partial<ServiceEntity>) {
    const service = await this.repo.findOne({ where: { id } });
    if (!service) throw new NotFoundException("Servicio no encontrado");

    service.name = (data.name ?? service.name).trim();
    service.duration = data.duration !== undefined ? Number(data.duration) : service.duration;
    service.price = data.price !== undefined ? Number(data.price) : service.price;

    return this.repo.save(service);
  }

  async remove(id: number) {
    const service = await this.repo.findOne({ where: { id } });
    if (!service) throw new NotFoundException("Servicio no encontrado");

    await this.repo.delete({ id });
    return { message: "Servicio eliminado" };
  }
}
