import { apiFetch } from "../../lib/apiFetch";
import { getProviderIdByCode } from "../../lib/providerIdGetter";
import { processAutoPartsPlusPage } from "./autoPartsPlusProcessor";

const API_ENDPOINT = "autopartsplus/catalog";
const CODE = "autopartsplus";
const PAGE_NAME = "page";
const LIMIT_NAME = "limit";

export async function getAutoPartsPlusCatalog() {
  const providerId: number = await getProviderIdByCode(CODE);
  let hasMore: boolean = true;
  let page: number = 1;
  while (hasMore) {
    const data = await apiFetch(API_ENDPOINT, page, PAGE_NAME, LIMIT_NAME);
    await processAutoPartsPlusPage(data, providerId, CODE);
    hasMore = data.pagination?.has_next ?? false;
    page++;
  }
}
