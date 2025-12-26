import { CatalogChange } from "../../lib/catalogChange";
import { emitCatalogBatch } from "../../lib/catalogEvents";
import { sequelize } from "../../db";
import { buildSpecs } from "./autoPartsPlusSpecsBuilder";
import { parseVehicleFit } from "./autoPartsPlusVehicleFitParser";
import { Product } from "../../models/Product";
import { Offer } from "../../models/Offer";
import { VehicleFit } from "../../models/VehicleFit";
import { Image } from "../../models/Image";

export async function processAutoPartsPlusPage(data: any, providerId: number, code: string) {
  const changeEvents: CatalogChange[] = [];
  for (const part of data.parts ?? []) {
    let changePayload: Record<string, unknown> | null = null;
    await sequelize.transaction(async (t) => {
      const specs = buildSpecs(part);
      const [product, created] = await Product.findOrCreate({
        where: { sku: part.sku },
        defaults: {
          oem_code: part.oem_code,
          name: part.title,
          description: part.desc,
          part_brand: part.brand_name,
          category: part.category_name,
          weight_value: part.weight_value,
          weight_unit: part.weight_unit,
          specs,
        },
        transaction: t,
      });
      if (!created) {
        await product.update(
          {
            oem_code: part.oem_code,
            name: part.title,
            description: part.desc,
            part_brand: part.brand_name,
            category: part.category_name,
            weight_value: part.weight_value,
            weight_unit: part.weight_unit,
            specs,
          },
          { transaction: t }
        );
      }

      const existingOffer = await Offer.findOne({
        where: { provider_id: providerId, product_id: product.id },
        transaction: t,
      });
      const stock_status =
        (part.qty_available ?? 0) > 0 ? "in_stock" : "out_of_stock";
      if (existingOffer) {
        const nextValues = {
          product_id: product.id,
          price_value: part.unit_price,
          currency: part.currency_code,
          stock_qty: part.qty_available,
          stock_status,
          dispatch_eta: null,
          last_seen_at: new Date(),
        };

        const hasChanges =
          existingOffer.price_value !== nextValues.price_value ||
          existingOffer.currency !== nextValues.currency ||
          existingOffer.stock_qty !== nextValues.stock_qty ||
          existingOffer.stock_status !== nextValues.stock_status;

        if (hasChanges) {
          await existingOffer.update(nextValues, { transaction: t });
          changePayload = {
            type: "catalog:update",
            change: "offer_updated",
            provider: code,
            provider_id: providerId,
            sku: part.sku,
            stock_qty: part.qty_available,
            stock_status,
            price_value: part.unit_price,
            currency: part.currency_code,
            at: new Date().toISOString(),
          };
        }
      } else {
        await Offer.create(
          {
            internal_id: part.part_id,
            provider_id: providerId,
            product_id: product.id,
            price_value: part.unit_price,
            currency: part.currency_code,
            stock_qty: part.qty_available,
            stock_status,
            dispatch_eta: null,
            last_seen_at: new Date(),
          },
          { transaction: t }
        );
        changePayload = {
          type: "catalog:update",
          change: "offer_created",
          provider: code,
          provider_id: providerId,
          sku: part.sku,
          stock_qty: part.qty_available,
          stock_status,
          price_value: part.unit_price,
          currency: part.currency_code,
          at: new Date().toISOString(),
        };
      }

      for (const f of part.fits_vehicles ?? []) {
        const parsed = parseVehicleFit(f);
        if (!parsed) continue;
        await VehicleFit.findOrCreate({
          where: { product_id: product.id, ...parsed },
          defaults: { product_id: product.id, ...parsed },
          transaction: t,
        });
      }

      for (const url of part.img_urls ?? []) {
        await Image.findOrCreate({
          where: { product_id: product.id, url },
          defaults: { product_id: product.id, url, type: null },
          transaction: t,
        });
      }
    });

    if (changePayload) {
      changeEvents.push(changePayload as CatalogChange);
    }
  }

  emitCatalogBatch(code, changeEvents);
}