import { User } from "../models/User.js";

export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    req.flash("error", "Please log in to continue.");
    return res.redirect("/login");
  }
  return next();
}

export function requireVendor(req, res, next) {
  if (!req.session?.userId) {
    req.flash("error", "Please log in to continue.");
    return res.redirect("/login");
  }
  if (req.session.role !== "vendor") {
    req.flash("error", "Vendor access only.");
    return res.redirect("/");
  }
  return next();
}

export function requireStudent(req, res, next) {
  if (!req.session?.userId) {
    req.flash("error", "Please log in to continue.");
    return res.redirect("/login");
  }
  if (req.session.role !== "student") {
    req.flash("error", "Student access only.");
    return res.redirect("/");
  }
  return next();
}

export async function requireVendorShop(req, res, next) {
  if (!req.session?.userId) {
    req.flash("error", "Please log in to continue.");
    return res.redirect("/login");
  }
  if (req.session.role !== "vendor") {
    req.flash("error", "Vendor access only.");
    return res.redirect("/");
  }
  const user = await User.findById(req.session.userId).select("shop");
  if (!user?.shop) {
    req.flash("error", "Your vendor account is not linked to a shop yet.");
    return res.redirect("/");
  }
  req.vendorShopId = user.shop;
  req.vendorShopIdStr = String(user.shop);
  return next();
}
