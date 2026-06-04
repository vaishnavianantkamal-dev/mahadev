import { Router } from "express";
import { db } from "../lib/db";
import { Role } from "@prisma/client";
import { requireRole, getCurrentUser } from "../lib/auth";

const router = Router();

// --- PUBLIC ENDPOINTS ---

// Fetch temple profile & configs
router.get("/profile", async (req, res) => {
  try {
    const temple = await db.temple.findFirst();
    if (!temple) return res.status(404).json({ error: "Temple config not found" });
    return res.json(temple);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// --- PROTECTED ADMIN/STAFF ENDPOINTS ---

router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

// Fetch Staff Directory (Requires admin level)
router.get("/staff", requireRole([Role.SUPER_ADMIN]), async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const users = await db.user.findMany({
      where: { templeId: temple.id },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create/Update Staff User (Requires admin level)
router.post("/staff", requireRole([Role.SUPER_ADMIN]), async (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const temple = await db.temple.findFirst();
    if (!temple) return res.status(400).json({ error: "Temple config not found." });

    const { id, name, email, role, active } = req.body;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    let savedUser;
    if (existingUser) {
      savedUser = await db.user.update({
        where: { email },
        data: {
          name,
          role: role as Role,
          active: !!active,
        },
      });
    } else {
      savedUser = await db.user.create({
        data: {
          id: id || `user_${Math.random().toString(36).substring(2, 10)}`,
          templeId: temple.id,
          name,
          email,
          role: role as Role,
          active: !!active,
        },
      });
    }

    // Create Audit Log
    await db.auditLog.create({
      data: {
        templeId: temple.id,
        userId: user.id,
        action: existingUser ? "UPDATE_STAFF_USER" : "CREATE_STAFF_USER",
        entity: "User",
        entityId: savedUser.id,
        meta: { email, role, active, actor: user.name },
      },
    });

    return res.json({ success: true, user: savedUser });
  } catch (error: any) {
    console.error("saveStaffUser error:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to save staff directory details." });
  }
});

// Update Temple Profile details (Requires super admin)
router.put("/profile", requireRole([Role.SUPER_ADMIN]), async (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const temple = await db.temple.findFirst();
    if (!temple) return res.status(400).json({ error: "Temple config not found." });

    const { name, phone, email, address, bankRef } = req.body;

    const updated = await db.temple.update({
      where: { id: temple.id },
      data: {
        name,
        phone,
        email,
        address,
        bankRef,
      },
    });

    // Create Audit Log
    await db.auditLog.create({
      data: {
        templeId: temple.id,
        userId: user.id,
        action: "UPDATE_TEMPLE_PROFILE",
        entity: "Temple",
        entityId: temple.id,
        meta: { name, actor: user.name },
      },
    });

    return res.json({ success: true, temple: updated });
  } catch (error: any) {
    console.error("updateTempleProfile error:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to update temple profile." });
  }
});

// Update Feature Toggles & UI Configs (Requires super admin/trustee)
router.put("/toggles", requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN]), async (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const temple = await db.temple.findFirst();
    if (!temple) return res.status(400).json({ error: "Temple config not found." });

    const { websiteActive, whatsappNotifications, emailNotifications, primaryColor, allowRoomBookings, allowServiceBookings } = req.body;

    const settings = {
      websiteActive: !!websiteActive,
      whatsappNotifications: !!whatsappNotifications,
      emailNotifications: !!emailNotifications,
      primaryColor: primaryColor || "#8a2e13",
      allowRoomBookings: !!allowRoomBookings,
      allowServiceBookings: !!allowServiceBookings,
    };

    const updated = await db.temple.update({
      where: { id: temple.id },
      data: {
        settings: settings as any,
      },
    });

    // Create Audit Log
    await db.auditLog.create({
      data: {
        templeId: temple.id,
        userId: user.id,
        action: "UPDATE_TEMPLE_SETTINGS",
        entity: "Temple",
        entityId: temple.id,
        meta: { settings, actor: user.name },
      },
    });

    return res.json({ success: true, temple: updated });
  } catch (error: any) {
    console.error("updateTempleSettings error:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to update configurations." });
  }
});

export default router;
