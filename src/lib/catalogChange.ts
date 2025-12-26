export type CatalogChange = {
  type: "catalog:update";
  change: "offer_created" | "offer_updated";
  provider: string;
  provider_id: number;
  sku: string;
  stock_qty: number | null;
  stock_status: string | null;
  price_value: number | null;
  currency: string | null;
  at: string;
};

