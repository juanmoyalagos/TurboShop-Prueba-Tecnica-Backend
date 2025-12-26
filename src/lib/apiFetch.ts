import { sleep } from "./sleep";

const API_BASE_URL = "https://web-production-84144.up.railway.app/api/";
const DEFAULT_LIMIT = 50;
const MAX_RETRIES = 3;
const BACKOFF_MS = 500;

export async function apiFetch(endpoint: string, page = 1, pageName: string, limitName: string) {
  const url = new URL(endpoint, API_BASE_URL);
  url.searchParams.set(pageName, String(page));
  url.searchParams.set(limitName, String(DEFAULT_LIMIT));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
      }
      return res.json();
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      await sleep(BACKOFF_MS * attempt);
    }
  }
}
