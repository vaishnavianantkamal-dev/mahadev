import { Router } from "express";
import { db } from "../lib/db";
import { sendWhatsAppMessage } from "../lib/whatsapp";
import { ChannelType, BroadcastStatus, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../lib/auth";

const router = Router();

const groupSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

const templateSchema = z.object({
  groupId: z.string(),
  name: z.string().min(2),
  channel: z.nativeEnum(ChannelType).default(ChannelType.WHATSAPP),
  body: z.string().min(5),
  variables: z.array(z.string()).default([]),
  whatsappTemplateName: z.string().optional(),
  language: z.string().default("en"),
  active: z.boolean().default(true),
});

// Protect communications endpoints (Requires admin/staff level)
router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

// Fetch groups and templates
router.get("/groups", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const groups = await db.messageGroup.findMany({
      where: { templeId: temple.id },
      include: { templates: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(groups);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create group
router.post("/groups", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");

    const val = groupSchema.parse(req.body);
    const group = await db.messageGroup.create({
      data: {
        ...val,
        templeId: temple.id,
      },
    });

    return res.json({ success: true, group });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Delete group
router.delete("/groups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.messageGroup.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Create template
router.post("/templates", async (req, res) => {
  try {
    const val = templateSchema.parse(req.body);
    const template = await db.messageTemplate.create({
      data: val,
    });

    return res.json({ success: true, template });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Delete template
router.delete("/templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.messageTemplate.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Fetch past broadcasts
router.get("/broadcasts", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const broadcasts = await db.broadcast.findMany({
      where: { templeId: temple.id },
      include: { template: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(broadcasts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Trigger broadcast to devotees
router.post("/broadcasts/trigger", async (req, res) => {
  try {
    const { templateId, cityFilter } = req.body;
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("Temple not found");

    const template = await db.messageTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new Error("Message template not found");

    const devotees = await db.devotee.findMany({
      where: {
        templeId: temple.id,
        consentWhatsapp: true,
        city: cityFilter ? { contains: cityFilter, mode: "insensitive" } : undefined,
      },
    });

    if (devotees.length === 0) {
      return res.status(400).json({ success: false, error: "No matching devotees found with active WhatsApp consent." });
    }

    const broadcast = await db.broadcast.create({
      data: {
        templeId: temple.id,
        templateId: template.id,
        audience: { cityFilter: cityFilter || "ALL" },
        status: BroadcastStatus.SENDING,
        sentCount: 0,
        failedCount: 0,
      },
    });

    let sent = 0;
    let failed = 0;

    for (const d of devotees) {
      let messageBody = template.body;
      messageBody = messageBody.replace(/\{\{name\}\}/g, d.name);
      messageBody = messageBody.replace(/\{\{phone\}\}/g, d.phone);
      messageBody = messageBody.replace(/\{\{city\}\}/g, d.city || "");
      messageBody = messageBody.replace(/\{\{gotra\}\}/g, d.gotra || "Kashyap");

      const resWhatsApp = await sendWhatsAppMessage(d.phone, messageBody);

      if (resWhatsApp.success) {
        sent++;
        await db.messageLog.create({
          data: {
            templeId: temple.id,
            devoteeId: d.id,
            broadcastId: broadcast.id,
            channel: ChannelType.WHATSAPP,
            body: messageBody,
            status: "SENT",
            providerMsgId: resWhatsApp.messageId,
          },
        });
      } else {
        failed++;
        await db.messageLog.create({
          data: {
            templeId: temple.id,
            devoteeId: d.id,
            broadcastId: broadcast.id,
            channel: ChannelType.WHATSAPP,
            body: messageBody,
            status: "FAILED",
          },
        });
      }
    }

    await db.broadcast.update({
      where: { id: broadcast.id },
      data: {
        status: BroadcastStatus.SENT,
        sentCount: sent,
        failedCount: failed,
      },
    });

    return res.json({ success: true, sentCount: sent, failedCount: failed });
  } catch (error: any) {
    console.error("Broadcast failed:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to deliver broadcast" });
  }
});

export default router;
