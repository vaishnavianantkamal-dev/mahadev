import { Router } from "express";
import { db } from "../lib/db";
import { DarshanType, MediaItemType, MediaCategory, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../lib/auth";

const router = Router();

const timingSchema = z.object({
  label: z.string().min(2),
  type: z.nativeEnum(DarshanType),
  time: z.string().min(2),
  dayRule: z.string().optional().default("Daily"),
  active: z.boolean().default(true),
});

const eventSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  isFestival: z.boolean().default(false),
  bannerUrl: z.string().optional(),
});

const liveSchema = z.object({
  title: z.string().min(2),
  youtubeId: z.string().min(2),
  isLive: z.boolean().default(false),
});

const mediaSchema = z.object({
  type: z.nativeEnum(MediaItemType),
  category: z.nativeEnum(MediaCategory),
  title: z.string().min(2),
  url: z.string().min(2),
  language: z.string().default("mr"),
});

// --- PUBLIC ENDPOINTS ---

// Fetch Darshan Timings
router.get("/timings", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const items = await db.darshanTiming.findMany({
      where: { templeId: temple.id },
      orderBy: { time: "asc" },
    });
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Fetch Events
router.get("/events", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const items = await db.event.findMany({
      where: { templeId: temple.id },
      orderBy: { startAt: "asc" },
    });
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Fetch Live Darshans
router.get("/live", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const items = await db.liveDarshan.findMany({
      where: { templeId: temple.id },
    });
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Fetch Media Items
router.get("/media", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const items = await db.mediaItem.findMany({
      where: { templeId: temple.id },
      orderBy: { createdAt: "desc" },
    });
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Fetch Site CMS Contents
router.get("/site", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const items = await db.siteContent.findMany({
      where: { templeId: temple.id },
      orderBy: { key: "asc" },
    });
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// --- PROTECTED ADMIN STAFF ENDPOINTS ---

router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

// Create Darshan Timing
router.post("/timings", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");
    const val = timingSchema.parse(req.body);
    const item = await db.darshanTiming.create({
      data: { ...val, templeId: temple.id },
    });
    return res.json({ success: true, item });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Delete Darshan Timing
router.delete("/timings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.darshanTiming.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Create Event
router.post("/events", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");
    const val = eventSchema.parse(req.body);
    const item = await db.event.create({
      data: { ...val, templeId: temple.id },
    });
    return res.json({ success: true, item });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Delete Event
router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.event.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Update Live Darshan stream details
router.put("/live/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const val = liveSchema.parse(req.body);
    const item = await db.liveDarshan.update({
      where: { id },
      data: val,
    });
    return res.json({ success: true, item });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Create Media Library item
router.post("/media", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");
    const val = mediaSchema.parse(req.body);
    const item = await db.mediaItem.create({
      data: { ...val, templeId: temple.id },
    });
    return res.json({ success: true, item });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Delete Media Library item
router.delete("/media/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.mediaItem.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Update Site Content key translation
router.put("/site/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, bodyRich } = req.body;
    const item = await db.siteContent.update({
      where: { id },
      data: { title, bodyRich },
    });
    return res.json({ success: true, item });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
