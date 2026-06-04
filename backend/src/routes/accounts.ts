import { Router } from "express";
import { db } from "../lib/db";
import { LedgerEntryType, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../lib/auth";

const router = Router();

const ledgerSchema = z.object({
  entryType: z.nativeEnum(LedgerEntryType),
  category: z.string().min(2),
  amount: z.number().min(0.01),
  source: z.string().default("COUNTER"),
  note: z.string().optional(),
});

// Protect accounts routes (Requires admin/staff level)
router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

router.get("/", async (req, res) => {
  try {
    const { entryType, category, startDate, endDate } = req.query;
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);

    const whereClause: any = { templeId: temple.id };
    if (entryType) whereClause.entryType = entryType as LedgerEntryType;
    if (category) whereClause.category = category as string;

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) whereClause.date.lte = new Date(endDate as string);
    }

    const entries = await db.ledgerEntry.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    const serialized = entries.map(e => ({
      ...e,
      amount: e.amount.toString(),
    }));

    return res.json(serialized);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");

    const val = ledgerSchema.parse(req.body);
    const entry = await db.ledgerEntry.create({
      data: {
        templeId: temple.id,
        entryType: val.entryType,
        category: val.category,
        amount: val.amount,
        source: val.source,
        note: val.note || null,
        createdBy: "SYSTEM",
      },
    });

    return res.json({ success: true, entry: { ...entry, amount: entry.amount.toString() } });
  } catch (error: any) {
    console.error("Failed to create ledger entry:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to save entry" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) {
      return res.json({
        totalCredits: 0,
        totalDebits: 0,
        netBalance: 0,
        monthlyCredits: 0,
        monthlyDebits: 0,
        monthlyNet: 0,
        categories: [],
      });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const aggregates = await db.ledgerEntry.groupBy({
      by: ["entryType"],
      where: { templeId: temple.id },
      _sum: { amount: true },
    });

    let totalCredits = 0;
    let totalDebits = 0;

    aggregates.forEach((agg) => {
      const amt = Number(agg._sum.amount || 0);
      if (agg.entryType === LedgerEntryType.CREDIT) {
        totalCredits = amt;
      } else {
        totalDebits = amt;
      }
    });

    const monthlyAggregates = await db.ledgerEntry.groupBy({
      by: ["entryType"],
      where: {
        templeId: temple.id,
        date: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    let monthlyCredits = 0;
    let monthlyDebits = 0;

    monthlyAggregates.forEach((agg) => {
      const amt = Number(agg._sum.amount || 0);
      if (agg.entryType === LedgerEntryType.CREDIT) {
        monthlyCredits = amt;
      } else {
        monthlyDebits = amt;
      }
    });

    const categoriesGroup = await db.ledgerEntry.groupBy({
      by: ["category", "entryType"],
      where: { templeId: temple.id },
      _sum: { amount: true },
    });

    const categoryBreakdown = categoriesGroup.map((c) => ({
      category: c.category,
      type: c.entryType,
      amount: Number(c._sum.amount || 0),
    }));

    return res.json({
      totalCredits,
      totalDebits,
      netBalance: totalCredits - totalDebits,
      monthlyCredits,
      monthlyDebits,
      monthlyNet: monthlyCredits - monthlyDebits,
      categories: categoryBreakdown,
    });
  } catch (error: any) {
    console.error("Accounts summary query failed:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
