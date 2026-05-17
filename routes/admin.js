import express from "express";
import { requireDb } from "../middleware/requireDb.js";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { Shop } from "../models/Shop.js";

export const adminRouter = express.Router();

console.log("Admin router loaded");

adminRouter.get(
  "/admin",
  requireDb,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const totalOrders = await Order.countDocuments();

    const completedOrders = await Order.countDocuments({
      status: "completed",
    });

    const pendingOrders = await Order.countDocuments({
      status: "paid",
    });

    const readyOrders = await Order.countDocuments({
      status: "ready_for_pickup",
    });

    const cancelledOrders = await Order.countDocuments({
      status: "cancelled",
    });

    const totalRevenueAgg = await Order.aggregate([
      {
        $match: {
          status: {
            $in: ["paid", "ready_for_pickup", "completed"],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$total",
          },
        },
      },
    ]);

    const totalRevenue =
      totalRevenueAgg[0]?.total || 0;

    const totalUsers = await User.countDocuments();

    const totalVendors = await User.countDocuments({
      role: "vendor",
    });

    const totalShops = await Shop.countDocuments();

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("shop", "name")
      .populate("customer", "name")
      .lean();

    res.render("admin/dashboard", {
      pageTitle: "Admin Dashboard",

      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        readyOrders,
        cancelledOrders,
        totalRevenue,
        totalUsers,
        totalVendors,
        totalShops,
      },

      recentOrders,
    });
  }
);
