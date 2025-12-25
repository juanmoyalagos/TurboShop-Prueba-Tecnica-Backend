import {
  Table,
  Column,
  Model,
  BelongsTo,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import type { Product } from "./Product";

@Table({
  tableName: "vehicle_fits",
  timestamps: true,
})
export class VehicleFit extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare product_id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare vehicle_make: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare vehicle_model: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare year_from: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare year_to: number;

  @BelongsTo(() => require("./Product").Product, {
    foreignKey: "product_id",
    as: "product",
  })
  declare product: Product;
}
