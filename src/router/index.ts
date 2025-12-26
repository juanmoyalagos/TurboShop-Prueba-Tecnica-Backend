import { Router } from "express";
import offersRouter from "./offersRouter";
import sseRouter from "./sseRouter";

const router = Router();

router.use("/offers", offersRouter);
router.use("/sse", sseRouter);

export default router;