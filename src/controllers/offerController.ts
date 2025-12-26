import { Request, Response } from "express";
import { Op } from "sequelize";
import { Product } from "../models/Product";
import { Offer } from "../models/Offer";
import { Provider } from "../models/Provider";
import { VehicleFit } from "../models/VehicleFit";
import { Image } from "../models/Image";

async function listOffers(req: Request, res: Response) {
  const {
    q,
    brand,
    make,
    model,
    year,
    page = "1",
    limit = "20",
  } = req.query as Record<string, string | undefined>;

  const pageNum = Math.max(parseInt(page || "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(limit || "20", 10), 1), 100);
  const offset = (pageNum - 1) * pageSize;

  const productWhere: any = {};
  if (q) {
    productWhere[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } },
      { sku: { [Op.iLike]: `%${q}%` } },
      { category: { [Op.iLike]: `%${q}%` } },
      { part_brand: { [Op.iLike]: `%${q}%` } },
    ];
  }
  if (brand) productWhere.part_brand = { [Op.iLike]: `%${brand}%` };

  const vehicleWhere: any = {};
  if (make) vehicleWhere.vehicle_make = { [Op.iLike]: `%${make}%` };
  if (model) vehicleWhere.vehicle_model = { [Op.iLike]: `%${model}%` };
  if (year) {
    const y = parseInt(year, 10);
    if (!Number.isNaN(y)) {
      vehicleWhere.year_from = { [Op.lte]: y };
      vehicleWhere.year_to = { [Op.gte]: y };
    }
  }
  const vehicleFilterActive = Object.keys(vehicleWhere).length > 0;

  const { rows, count } = await Product.findAndCountAll({
    where: productWhere,
    include: [
      {
        model: VehicleFit,
        as: "vehicleFits",
        attributes: ["vehicle_make", "vehicle_model", "year_from", "year_to"],
        required: vehicleFilterActive,
        where: vehicleFilterActive ? vehicleWhere : undefined,
      },
      {
        model: Offer,
        as: "offers",
        attributes: [
          "id",
          "provider_id",
          "price_value",
          "currency",
          "stock_qty",
          "stock_status",
          "last_seen_at",
        ],
        include: [
          {
            model: Provider,
            as: "provider",
            attributes: ["id", "code", "name"],
          },
        ],
      },
      {
        model: Image,
        as: "images",
        attributes: ["url", "type"],
      }
    ],
    distinct: true,
    order: [["updatedAt", "DESC"]],
    limit: pageSize,
    offset,
  });

  res.json({
    data: rows,
    page: pageNum,
    limit: pageSize,
    total: count,
    totalPages: Math.ceil(count / pageSize),
  });
}

async function getOfferBySku(req: Request, res: Response) {
  const { sku } = req.params;
  const product = await Product.findOne({
    where: { sku },
    include: [
      {
        model: Offer,
        as: "offers",
        required: true,
        include: [
          { model: Provider, as: "provider", attributes: ["id", "code", "name"] },
        ],
      },
      {
        model: VehicleFit,
        as: "vehicleFits",
        attributes: ["vehicle_make", "vehicle_model", "year_from", "year_to"],
      },
      {
        model: Image,
        as: "images",
        attributes: ["url", "type"],
      }
    ],
  });
  if (!product) return res.status(404).json({ message: "Oferta/Producto no encontrado" });
  res.json(product);
}

export const offerController = { listOffers, getOfferBySku };