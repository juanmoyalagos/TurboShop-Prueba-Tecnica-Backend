import { apiFetch } from "../../lib/apiFetch";
import { getProviderIdByCode } from "../../lib/providerIdGetter";
import { processRepuestosMaxPage } from "./repuestosMaxProcessor";

const API_ENDPOINT = "repuestosmax/catalogo";
const CODE = "repuestosmax";
const PAGE_NAME = "pagina";
const LIMIT_NAME = "limite";

export async function getRepuestosMaxCatalog() {
  const providerId = await getProviderIdByCode(CODE);
  let hasMore = true;
  let page = 1;
  while (hasMore) {
    const data = await apiFetch(API_ENDPOINT, page, PAGE_NAME, LIMIT_NAME);
    await processRepuestosMaxPage(data, providerId, CODE);
    hasMore = data?.paginacion?.tieneSiguiente ?? false;
    page++;
  }
}