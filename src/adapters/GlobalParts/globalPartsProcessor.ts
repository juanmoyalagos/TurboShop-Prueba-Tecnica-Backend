import { CatalogChange } from "../../lib/catalogChange";
import { emitCatalogBatch } from "../../lib/catalogEvents";
import { sequelize } from "../../db";
import { buildSpecs } from "./globalPartsSpecsBuilder";
import { parseVehicleFit } from "./globalPartsVehicleFitParser";
import { Product } from "../../models/Product";
import { Offer } from "../../models/Offer";
import { VehicleFit } from "../../models/VehicleFit";
import { Image } from "../../models/Image";

export async function processGlobalPartsPage(data: any, providerId: number, code: string) {
    const items = data?.ResponseEnvelope?.Body?.CatalogListing?.Items ?? [];
    const changeEvents: CatalogChange[] = [];
  
    for (const item of items) {
      let changePayload: CatalogChange | null = null;
      await sequelize.transaction(async (t) => {
        const specs = buildSpecs(item);
        const sku = item?.ItemHeader?.ExternalReferences?.SKU?.Value;
        const oem = item?.ItemHeader?.ExternalReferences?.OEM?.Value;
        const internalId = item?.ItemHeader?.InternalId;
  
        const [product, created] = await Product.findOrCreate({
          where: { sku },
          defaults: {
            oem_code: oem,
            name: item?.ProductDetails?.NameInfo?.DisplayName,
            description: item?.ProductDetails?.Description?.FullText,
            part_brand: item?.ProductDetails?.BrandInfo?.BrandName,
            category: item?.ProductDetails?.CategoryInfo?.PrimaryCategory?.Name,
            weight_value: item?.PhysicalAttributes?.Weight?.Value ?? null,
            weight_unit: item?.PhysicalAttributes?.Weight?.Unit ?? null,
            specs,
          },
          transaction: t,
        });
  
        if (!created) {
          await product.update(
            {
              oem_code: oem,
              name: item?.ProductDetails?.NameInfo?.DisplayName,
              description: item?.ProductDetails?.Description?.FullText,
              part_brand: item?.ProductDetails?.BrandInfo?.BrandName,
              category: item?.ProductDetails?.CategoryInfo?.PrimaryCategory?.Name,
              weight_value: item?.PhysicalAttributes?.Weight?.Value ?? null,
              weight_unit: item?.PhysicalAttributes?.Weight?.Unit ?? null,
              specs,
            },
            { transaction: t }
          );
        }
  
        const existingOffer = await Offer.findOne({
          where: { provider_id: providerId, product_id: product.id },
          transaction: t,
        });
  
        const stock_qty = item?.AvailabilityInfo?.QuantityInfo?.AvailableQuantity ?? null;
        const stock_status = item?.AvailabilityInfo?.StockStatus?.Code ?? null;
        const price_value = item?.PricingInfo?.ListPrice?.Amount ?? null;
        const currency = item?.PricingInfo?.ListPrice?.CurrencyCode ?? null;
        const dispatch_eta = item?.AvailabilityInfo?.ShippingInfo?.EstimatedShipDate ?? null;
  
        if (existingOffer) {
          const nextValues = {
            product_id: product.id,
            price_value,
            currency,
            stock_qty,
            stock_status,
            dispatch_eta,
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
              sku,
              stock_qty,
              stock_status,
              price_value,
              currency,
              at: new Date().toISOString(),
            };
          }
        } else {
          await Offer.create(
            {
              internal_id: internalId,
              provider_id: providerId,
              product_id: product.id,
              price_value,
              currency,
              stock_qty,
              stock_status,
              dispatch_eta,
              last_seen_at: new Date(),
            },
            { transaction: t }
          );
          changePayload = {
            type: "catalog:update",
            change: "offer_created",
            provider: code,
            provider_id: providerId,
            sku,
            stock_qty,
            stock_status,
            price_value,
            currency,
            at: new Date().toISOString(),
          };
        }
  
        for (const v of item?.VehicleCompatibility?.CompatibleVehicles ?? []) {
          const parsed = parseVehicleFit(v);
          if (!parsed) continue;
          await VehicleFit.findOrCreate({
            where: { product_id: product.id, ...parsed },
            defaults: { product_id: product.id, ...parsed },
            transaction: t,
          });
        }
  
        for (const img of item?.MediaAssets?.Images ?? []) {
          if (!img?.ImageUrl) continue;
          await Image.findOrCreate({
            where: { product_id: product.id, url: img.ImageUrl },
            defaults: { product_id: product.id, url: img.ImageUrl, type: img.ImageType ?? null },
            transaction: t,
          });
        }
      });
  
      if (changePayload) {
        changeEvents.push(changePayload);
      }
    }
  
    emitCatalogBatch(code, changeEvents);
  }