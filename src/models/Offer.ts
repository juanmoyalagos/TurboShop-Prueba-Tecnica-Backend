import {
  Table,
  Column,
  Model,
  BelongsTo,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import type { Provider } from "./Provider";
import type { Product } from "./Product";

@Table({
  tableName: "offers",
  timestamps: true,
})
export class Offer extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare product_id: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare provider_id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare internal_id: string;

  @Column(DataType.INTEGER)
  declare price_value: number | null;

  @Column(DataType.STRING)
  declare currency: string | null;

  @Column(DataType.INTEGER)
  declare stock_qty: number | null;

  @Column(DataType.STRING)
  declare stock_status: string | null;

  @Column(DataType.STRING)
  declare dispatch_eta: string | null;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare last_seen_at: Date;

  @BelongsTo(() => require("./Product").Product, {
    foreignKey: "product_id",
    as: "product",
  })
  declare product: Product;

  @BelongsTo(() => require("./Provider").Provider, {
    foreignKey: "provider_id",
    as: "provider",
  })
  declare provider: Provider;
}
