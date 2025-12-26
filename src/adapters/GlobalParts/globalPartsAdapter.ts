import { apiFetch } from "../../lib/apiFetch";
import { getProviderIdByCode } from "../../lib/providerIdGetter";
import { processGlobalPartsPage } from "./globalPartsProcessor";

const API_ENDPOINT = "globalparts/inventory/catalog";
const CODE = "globalparts";
const PAGE_PARAM = "page";
const LIMIT_PARAM = "itemsPerPage";

export async function getGlobalPartsCatalog() {
  const providerId = await getProviderIdByCode(CODE);
  let hasMore = true;
  let page = 1;

  while (hasMore) {
    const data = await apiFetch(API_ENDPOINT, page, PAGE_PARAM, LIMIT_PARAM);
    await processGlobalPartsPage(data, providerId, CODE);
    hasMore =
      data?.ResponseEnvelope?.Body?.CatalogListing?.PaginationInfo?.HasNextPage ??
      data?.ResponseEnvelope?.Footer?.Pagination?.HasMoreResults ??
      false;
    page++;
  }
}

