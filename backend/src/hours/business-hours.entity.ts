import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class BusinessHours {
  @PrimaryGeneratedColumn()
  id: number;

  // 1 = Lunes ... 7 = Domingo
  @Column({ type: "int", unique: true })
  dayOfWeek: number;

  @Column({ type: "boolean", default: false })
  closed: boolean;

  @Column({ type: "time", nullable: true })
  openTime?: string;

  @Column({ type: "time", nullable: true })
  closeTime?: string;
}
