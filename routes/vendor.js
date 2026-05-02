import express from "express";
import { Order } from "../models/Order.js";
import { requireDb } from "../middleware/requireDb.js";
import { requireVendorShop } from "../middleware/auth.js";

export const vendorRouter = express.Router();

vendorRouter.get("/vendor/verify", requireDb, requireVendorShop, async (req, res) => {
  const pending = await Order.countDocuments({
    shop: req.vendorShopId,
    status: "paid",
  });
  res.render("vendor/verify", { pageTitle: "Verify pickup", pending });
});

vendorRouter.post("/vendor/verify", requireDb, requireVendorShop, async (req, res) => {
  const raw = String((req.body && req.body.otp) || "").replace(/\D/g, "");
  const otp = raw.slice(0, 6);

  if (otp.length !== 6) {
    req.flash("error", "Enter the 6-digit pickup code.");
    return res.redirect("/vendor/verify");
  }

  const order = await Order.findOne({
    shop: req.vendorShopId,
    pickupOtp: otp,
    status: "paid",
  })
    .populate("customer", "name email")
    .lean();

  if (!order) {
    req.flash("error", "No active order matches that code.");
    return res.redirect("/vendor/verify");
  }

  await Order.updateOne({ _id: order._id }, { $set: { status: "completed" } });
  req.flash("success", `Order completed for ${order.customer?.name || "customer"}.`);
  return res.redirect("/vendor/verify");
});
