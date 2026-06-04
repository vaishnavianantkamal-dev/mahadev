import { Router } from "express";
import { getDashboardStats } from "../lib/dashboard";
import { Role } from "@prisma/client";
import { requireRole } from "../lib/auth";

const router = Router();

// Protect dashboard stats
router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

router.get("/stats", async (req, res) => {
  try {
    const stats = await getDashboardStats();
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
