import { eventBus } from "../controllers/sseController";
import { CatalogChange } from "./catalogChange";

export function emitCatalogBatch(provider: string, items: CatalogChange[]) {
  if (!items.length) return;
  eventBus.emit("change", {
    type: "catalog:update_batch",
    provider,
    items,
    at: new Date().toISOString(),
  });
}

