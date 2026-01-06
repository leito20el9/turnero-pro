import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  // 0 = Domingo, 1 = Lunes ... 6 = Sábado
  @Column()
  dayOfWeek: number;

  @Column()
  startHour: string; // "09:00"

  @Column()
  endHour: string; // "18:00"
}
