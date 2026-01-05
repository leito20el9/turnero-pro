import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { AvailabilityModule } from './availability/availability.module';
import { ScheduleModule } from './schedule/schedule.module';
import { BlocksModule } from './blocks/blocks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '9478106',
      database: 'turnero_db',
      autoLoadEntities: true,
      synchronize: true, // solo en desarrollo
    }),
    AuthModule,
    AdminModule,
    ServicesModule,
    BookingsModule,
    AvailabilityModule,
    ScheduleModule,
    BlocksModule,
  ],
})
export class AppModule {}

