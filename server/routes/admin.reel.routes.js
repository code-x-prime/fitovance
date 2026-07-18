import express from "express";
import {
  getReels,
  getReel,
  createReel,
  updateReel,
  deleteReel,
  reorderReels,
  bulkUpdateReels,
  bulkDeleteReels,
} from "../controllers/admin.reel.controller.js";
import { verifyAdminJWT, hasPermission } from "../middlewares/admin.middleware.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const uploadReelFiles = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

// Bulk routes MUST come before parameterized routes
router.get("/reels", verifyAdminJWT, hasPermission("banners", "read"), getReels);
router.post("/reels", verifyAdminJWT, hasPermission("banners", "create"), uploadReelFiles, createReel);
router.patch("/reels/reorder", verifyAdminJWT, hasPermission("banners", "update"), reorderReels);
router.patch("/reels/bulk/status", verifyAdminJWT, hasPermission("banners", "update"), bulkUpdateReels);
router.post("/reels/bulk/delete", verifyAdminJWT, hasPermission("banners", "delete"), bulkDeleteReels);

// Parameterized routes come AFTER bulk/fixed routes
router.get("/reels/:reelId", verifyAdminJWT, hasPermission("banners", "read"), getReel);
router.put("/reels/:reelId", verifyAdminJWT, hasPermission("banners", "update"), uploadReelFiles, updateReel);
router.delete("/reels/:reelId", verifyAdminJWT, hasPermission("banners", "delete"), deleteReel);

export default router;
