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
import type { VehicleFit } from "./VehicleFit";
import type { Image } from "./Image";

@Table({
  tableName: "products",
  timestamps: true,
})
export class Product extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare sku: string;

  @Column(DataType.STRING)
  declare oem_code: string | null;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @Column(DataType.STRING)
  declare part_brand: string | null;

  @Column(DataType.STRING)
  declare category: string | null;

  @Column(DataType.FLOAT)
  declare weight_value: number | null;

  @Column(DataType.STRING)
  declare weight_unit: string | null;

  @Column(DataType.JSONB)
  declare specs: object | null;

  @HasMany(() => require("./Offer").Offer, {
    foreignKey: "product_id",
    as: "offers",
  })
  declare offers: Offer[];

  @HasMany(() => require("./VehicleFit").VehicleFit, {
    foreignKey: "product_id",
    as: "vehicleFits",
  })
  declare vehicleFits: VehicleFit[];

  @HasMany(() => require("./Image").Image, {
    foreignKey: "product_id",
    as: "images",
  })
  declare images: Image[];
}
