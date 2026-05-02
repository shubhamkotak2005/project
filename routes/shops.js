import express from "express";
import { Shop } from "../models/Shop.js";
import { MenuItem } from "../models/MenuItem.js";
import { requireDb } from "../middleware/requireDb.js";

export const shopsRouter = express.Router();

shopsRouter.get("/shops", requireDb, async (req, res) => {
  const shops = await Shop.find().sort({ name: 1 }).lean();
  res.render("shops/index", { pageTitle: "Canteens", shops });
});

shopsRouter.get("/shops/:slug", requireDb, async (req, res) => {
  const shop = await Shop.findOne({ slug: String(req.params.slug).toLowerCase().trim() }).lean();
  if (!shop) {
    req.flash("error", "Canteen not found.");
    return res.redirect("/shops");
  }
  const menuItems = await MenuItem.find({ shop: shop._id }).sort({ name: 1 }).lean();
  res.render("shops/menu", { pageTitle: shop.name, shop, menuItems });
});
