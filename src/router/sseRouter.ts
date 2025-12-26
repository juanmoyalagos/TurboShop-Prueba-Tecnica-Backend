import { Router } from "express";
import { sseHandler } from "../controllers/sseController";

const router = Router();
router.get("/events", sseHandler);

export default router;