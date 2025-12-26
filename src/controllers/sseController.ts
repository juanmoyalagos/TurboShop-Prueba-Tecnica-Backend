import { Request, Response } from "express";
import { EventEmitter } from "events";
import { startPolling, stopPolling } from "../poller";

export const eventBus = new EventEmitter();
let sseSubscribers = 0;

export function sseHandler(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (payload: any) =>
    res.write(`data: ${JSON.stringify(payload)}\n\n`);

  send({ type: "connected", at: new Date().toISOString() });

  const onChange = (payload: any) => send(payload);
  eventBus.on("change", onChange);
  sseSubscribers += 1;
  console.log(`[SSE] client connected. active=${sseSubscribers}`);
  if (sseSubscribers === 1) {
    startPolling();
  }

  const hb = setInterval(() => res.write(": keep-alive\n\n"), 15000);

  req.on("close", () => {
    clearInterval(hb);
    eventBus.off("change", onChange);
    sseSubscribers = Math.max(0, sseSubscribers - 1);
    console.log(`[SSE] client disconnected. active=${sseSubscribers}`);
    if (sseSubscribers === 0) {
      stopPolling();
    }
  });
}