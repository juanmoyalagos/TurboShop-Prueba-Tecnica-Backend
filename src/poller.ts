import { getAutoPartsPlusCatalog } from "./adapters/AutoPartsPlus/autoPartsPlusAdapter";
import { getRepuestosMaxCatalog } from "./adapters/RepuestosMax/repuestosMaxAdapter";
import { getGlobalPartsCatalog } from "./adapters/GlobalParts/globalPartsAdapter";
import { sleep } from "./lib/sleep";

const PROVIDER_JOBS = [
  getAutoPartsPlusCatalog,
  getRepuestosMaxCatalog,
  getGlobalPartsCatalog,
];
const INTERVAL_MS = 5000;

let isPolling = false;
let stopRequested = false;
let loopPromise: Promise<void> | null = null;
let stopTimer: NodeJS.Timeout | null = null;

async function pollLoop() {
  while (!stopRequested) {
    try {
      await Promise.all(
        PROVIDER_JOBS.map(async (job) => {
          try {
            await job();
          } catch (err) {
            console.error("Error en el trabajo de poll:", err);
          }
        })
      );
      console.log("Poll completada para todos los proveedores");
    } catch (err) {
      console.error("Error en el bucle de poll:", err);
    }
    if (stopRequested) break;
    await sleep(INTERVAL_MS);
  }
  isPolling = false;
  loopPromise = null;
}

export function startPolling() {
  if (isPolling) return;
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
  stopRequested = false;
  isPolling = true;
  loopPromise = pollLoop();
}

export async function stopPolling() {
  if (!isPolling) return;
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
  stopTimer = setTimeout(async () => {
    stopRequested = true;
    try {
      await loopPromise;
    } catch {
    } finally {
      stopTimer = null;
    }
  }, 5000);
}