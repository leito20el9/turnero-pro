import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BusinessHours } from "./business-hours.entity";

type HoursDTO = {
  dayOfWeek: number;
  closed: boolean;
  openTime?: string;
  closeTime?: string;
};

@Injectable()
export class HoursService {
  constructor(
    @InjectRepository(BusinessHours)
    private repo: Repository<BusinessHours>,
  ) {}

  private defaultWeek(): HoursDTO[] {
    // L-V 09:00-18:00, S 09:00-13:00, D cerrado
    return [
      { dayOfWeek: 1, closed: false, openTime: "09:00", closeTime: "18:00" },
      { dayOfWeek: 2, closed: false, openTime: "09:00", closeTime: "18:00" },
      { dayOfWeek: 3, closed: false, openTime: "09:00", closeTime: "18:00" },
      { dayOfWeek: 4, closed: false, openTime: "09:00", closeTime: "18:00" },
      { dayOfWeek: 5, closed: false, openTime: "09:00", closeTime: "18:00" },
      { dayOfWeek: 6, closed: false, openTime: "09:00", closeTime: "13:00" },
      { dayOfWeek: 7, closed: true },
    ];
  }

  async getAll() {
    const items = await this.repo.find({ order: { dayOfWeek: "ASC" } });

    // si no hay nada, sembramos defaults
    if (items.length === 0) {
      await this.repo.save(this.defaultWeek().map((x) => this.repo.create(x)));
      return this.repo.find({ order: { dayOfWeek: "ASC" } });
    }

    return items;
  }

  async upsertAll(payload: HoursDTO[]) {
    if (!Array.isArray(payload) || payload.length !== 7) {
      throw new BadRequestException("Debes enviar 7 días (1..7).");
    }

    for (const h of payload) {
      if (h.dayOfWeek < 1 || h.dayOfWeek > 7) {
        throw new BadRequestException("dayOfWeek debe ser 1..7");
      }

      if (!h.closed) {
        if (!h.openTime || !h.closeTime) {
          throw new BadRequestException("openTime y closeTime son requeridos si no está cerrado.");
        }
        if (h.closeTime <= h.openTime) {
          throw new BadRequestException("closeTime debe ser mayor que openTime.");
        }
      }
    }

    // upsert por dayOfWeek (simple)
    for (const h of payload) {
      const existing = await this.repo.findOne({ where: { dayOfWeek: h.dayOfWeek } });
      if (!existing) {
        await this.repo.save(this.repo.create(h));
      } else {
        existing.closed = h.closed;
        existing.openTime = h.closed ? undefined : h.openTime;
        existing.closeTime = h.closed ? undefined : h.closeTime;
        await this.repo.save(existing);
      }
    }

    return this.getAll();
  }
}
