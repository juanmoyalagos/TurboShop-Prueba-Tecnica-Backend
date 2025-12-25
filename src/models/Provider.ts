import {
  Table,
  Column,
  Model,
  HasMany,
  DataType,
  AllowNull,
  Unique,
} from "sequelize-typescript";
import type { Offer } from "./Offer";

@Table({
  tableName: "providers",
  timestamps: true,
})
export class Provider extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare code: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @HasMany(() => require("./Offer").Offer, {
    foreignKey: "provider_id",
    as: "offers",
  })
  declare offers: Offer[];
}
