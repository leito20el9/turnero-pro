import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "int" })
  duration: number;

  @Column({ type: "int", nullable: true })
  price?: number | null;
}
