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
  tableName: "images",
  timestamps: true,
})
export class Image extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare product_id: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare url: string;

  @Column(DataType.STRING)
  declare type: string | null;

  @BelongsTo(() => require("./Product").Product, {
    foreignKey: "product_id",
    as: "product",
  })
  declare product: Product;
}
