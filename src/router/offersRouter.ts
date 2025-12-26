import { Router } from "express";
import { offerController } from "../controllers/offerController";

const router = Router();

router.get("/", offerController.listOffers);
router.get("/:sku", offerController.getOfferBySku);

export default router;