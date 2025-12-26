import { CatalogChange } from "../../lib/catalogChange";
import { emitCatalogBatch } from "../../lib/catalogEvents";
import { sequelize } from "../../db";
import { buildSpecs } from "./repuestosMaxSpecsBuilder";
import { parseVehicleFit } from "./repuestosMaxVehicleFitParser";
import { Product } from "../../models/Product";
import { Offer } from "../../models/Offer";
import { VehicleFit } from "../../models/VehicleFit";
import { Image } from "../../models/Image";

export async function processRepuestosMaxPage(data: any, providerId: number, code: string) {
    const changeEvents: CatalogChange[] = [];
    for (const part of data.productos ?? []) {
      let changePayload: CatalogChange | null = null;
      await sequelize.transaction(async (t) => {
        const specs = buildSpecs(part);
        const [product, created] = await Product.findOrCreate({
          where: { sku: part.identificacion?.sku },
          defaults: {
            oem_code: part.identificacion?.codigoOEM,
            name: part.informacionBasica?.nombre,
            description: part.informacionBasica?.descripcion,
            part_brand: part.informacionBasica?.marca?.nombre,
            category: part.informacionBasica?.categoria?.nombre,
            weight_value: part.caracteristicas?.peso?.valor ?? null,
            weight_unit: part.caracteristicas?.peso?.unidad ?? null,
            specs,
          },
          transaction: t,
        });
  
        if (!created) {
          await product.update(
            {
              oem_code: part.identificacion?.codigoOEM,
              name: part.informacionBasica?.nombre,
              description: part.informacionBasica?.descripcion,
              part_brand: part.informacionBasica?.marca?.nombre,
              category: part.informacionBasica?.categoria?.nombre,
              weight_value: part.caracteristicas?.peso?.valor ?? null,
              weight_unit: part.caracteristicas?.peso?.unidad ?? null,
              specs,
            },
            { transaction: t }
          );
        }
  
        const internalId = part.identificacion?.codigoInterno;
        const existingOffer = await Offer.findOne({
          where: { provider_id: providerId, product_id: product.id },
          transaction: t,
        });
        const stock_qty = part.inventario?.cantidad ?? null;
        const stock_status = part.inventario?.estado ?? null;
  
        if (existingOffer) {
          const nextValues = {
            product_id: product.id,
            price_value: part.precio?.valor ?? null,
            currency: part.precio?.moneda ?? null,
            stock_qty,
            stock_status,
            dispatch_eta: part.inventario?.tiempoDespachoEstimado ?? null,
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
              sku: part.identificacion?.sku,
              stock_qty,
              stock_status,
              price_value: part.precio?.valor ?? null,
              currency: part.precio?.moneda ?? null,
              at: new Date().toISOString(),
            };
          }
        } else {
          await Offer.create(
            {
              internal_id: internalId,
              provider_id: providerId,
              product_id: product.id,
              price_value: part.precio?.valor ?? null,
              currency: part.precio?.moneda ?? null,
              stock_qty,
              stock_status,
              dispatch_eta: part.inventario?.tiempoDespachoEstimado ?? null,
              last_seen_at: new Date(),
            },
            { transaction: t }
          );
          changePayload = {
            type: "catalog:update",
            change: "offer_created",
            provider: code,
            provider_id: providerId,
            sku: part.identificacion?.sku,
            stock_qty,
            stock_status,
            price_value: part.precio?.valor ?? null,
            currency: part.precio?.moneda ?? null,
            at: new Date().toISOString(),
          };
        }
  
        for (const v of part.compatibilidad?.vehiculos ?? []) {
          const parsed = parseVehicleFit(v);
          if (!parsed) continue;
          await VehicleFit.findOrCreate({
            where: { product_id: product.id, ...parsed },
            defaults: { product_id: product.id, ...parsed },
            transaction: t,
          });
        }
  
        for (const img of part.multimedia?.imagenes ?? []) {
          if (!img?.url) continue;
          await Image.findOrCreate({
            where: { product_id: product.id, url: img.url },
            defaults: { product_id: product.id, url: img.url, type: img.tipo ?? null },
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