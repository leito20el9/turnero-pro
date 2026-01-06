import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BusinessHours } from "./business-hours.entity";
import { HoursService } from "./hours.service";
import { HoursController } from "./hours.controller";

@Module({
  imports: [TypeOrmModule.forFeature([BusinessHours])],
  providers: [HoursService],
  controllers: [HoursController],
})
export class HoursModule {}
