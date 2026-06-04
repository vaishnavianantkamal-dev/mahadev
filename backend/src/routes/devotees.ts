import { Router } from "express";
import { db } from "../lib/db";
import { DevoteeSource, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../lib/auth";

const router = Router();

const devoteeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  gotra: z.string().optional(),
  notes: z.string().optional(),
  source: z.nativeEnum(DevoteeSource).default(DevoteeSource.WALKIN),
  consentWhatsapp: z.boolean().default(true),
});

// Protect all devotee routes for logged in staff/admins
router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);

    const devotees = await db.devotee.findMany({
      where: {
        templeId: temple.id,
        OR: search ? [
          { name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ] : undefined,
      },
      orderBy: { lastInteractionAt: "desc" },
    });

    const serialized = devotees.map(dev => ({
      ...dev,
      totalDonations: dev.totalDonations.toString()
    }));

    return res.json(serialized);
  } catch (error: any) {
    console.error("Failed to fetch devotees:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch devotees" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const devotee = await db.devotee.findUnique({
      where: { id },
      include: {
        bookings: {
          include: { serviceType: { select: { name: true } } },
          orderBy: { date: "desc" },
        },
        roomBookings: {
          include: { room: { select: { name: true, roomType: true } } },
          orderBy: { checkIn: "desc" },
        },
        donations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!devotee) {
      return res.status(404).json({ error: "Devotee not found" });
    }

    const serialized = {
      ...devotee,
      totalDonations: devotee.totalDonations.toString(),
      bookings: devotee.bookings.map(b => ({
        ...b,
        amount: b.amount.toString(),
      })),
      roomBookings: devotee.roomBookings.map(rb => ({
        ...rb,
        amount: rb.amount.toString(),
      })),
      donations: devotee.donations.map(d => ({
        ...d,
        amount: d.amount.toString(),
      })),
    };

    return res.json(serialized);
  } catch (error: any) {
    console.error("Failed to get devotee details:", error);
    return res.status(500).json({ error: error.message || "Failed to get devotee details" });
  }
});

router.post("/", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found in database");

    const validated = devoteeSchema.parse(req.body);

    const existing = await db.devotee.findFirst({
      where: {
        templeId: temple.id,
        phone: validated.phone,
      },
    });

    if (existing) {
      return res.json({
        success: true,
        devotee: { ...existing, totalDonations: existing.totalDonations.toString() },
        wasDeduplicated: true
      });
    }

    const devotee = await db.devotee.create({
      data: {
        ...validated,
        email: validated.email || null,
        templeId: temple.id,
        totalDonations: 0,
      },
    });

    return res.json({
      success: true,
      devotee: { ...devotee, totalDonations: devotee.totalDonations.toString() },
      wasDeduplicated: false
    });
  } catch (error: any) {
    console.error("Failed to create devotee:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to create devotee" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validated = devoteeSchema.parse(req.body);

    const devotee = await db.devotee.update({
      where: { id },
      data: {
        ...validated,
        email: validated.email || null,
      },
    });

    return res.json({
      success: true,
      devotee: { ...devotee, totalDonations: devotee.totalDonations.toString() }
    });
  } catch (error: any) {
    console.error("Failed to update devotee:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to update devotee" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.$transaction([
      db.booking.deleteMany({ where: { devoteeId: id } }),
      db.roomBooking.deleteMany({ where: { devoteeId: id } }),
      db.donation.updateMany({ where: { devoteeId: id }, data: { devoteeId: null } }),
      db.messageLog.deleteMany({ where: { devoteeId: id } }),
      db.devotee.delete({ where: { id } }),
    ]);

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete devotee:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to delete devotee" });
  }
});

export default router;
