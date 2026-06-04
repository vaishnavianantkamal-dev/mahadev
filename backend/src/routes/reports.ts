import { Router } from "express";
import { db } from "../lib/db";
import { LedgerEntryType, DevoteeSource, Role } from "@prisma/client";
import { requireRole } from "../lib/auth";

const router = Router();

// Protect reports endpoint
router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

router.get("/", async (req, res) => {
  try {
    const temple = await db.temple.findFirst();
    if (!temple) return res.status(404).json({ error: "Temple config not found" });

    // 1. Fetch system audit logs (last 150)
    const auditLogs = await db.auditLog.findMany({
      where: { templeId: temple.id },
      orderBy: { createdAt: "desc" },
      take: 150,
    });

    const auditLogsMapped = auditLogs.map(log => ({
      id: log.id,
      createdAt: log.createdAt.toISOString(),
      userId: log.userId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      meta: log.meta,
    }));

    // 2. Financial Metrics & Totals
    const totalDevotees = await db.devotee.count();
    
    const successfulDonations = await db.donation.aggregate({
      where: { templeId: temple.id, status: "SUCCESS" },
      _sum: { amount: true },
      _avg: { amount: true },
    });
    const avgDonation = Number(successfulDonations._avg.amount || 0);
    const totalDonationsSum = Number(successfulDonations._sum.amount || 0);

    const successfulBookings = await db.booking.aggregate({
      where: { templeId: temple.id, status: "CONFIRMED" },
      _sum: { amount: true },
    });
    const totalPoojaSales = Number(successfulBookings._sum.amount || 0);

    const successfulRooms = await db.roomBooking.aggregate({
      where: { templeId: temple.id, status: "CONFIRMED" },
      _sum: { amount: true },
    });
    const totalRoomSales = Number(successfulRooms._sum.amount || 0);

    const totalContributed = totalDonationsSum + totalPoojaSales + totalRoomSales;
    const avgDevoteeValue = totalDevotees ? totalContributed / totalDevotees : 0;

    // 3. Ledger Trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ledgerEntries = await db.ledgerEntry.findMany({
      where: { templeId: temple.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "asc" },
    });

    const trendsMap = new Map<string, { credit: number; debit: number }>();
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      trendsMap.set(dateStr, { credit: 0, debit: 0 });
    }

    for (const entry of ledgerEntries) {
      const dateStr = new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const existing = trendsMap.get(dateStr) || { credit: 0, debit: 0 };
      if (entry.entryType === LedgerEntryType.CREDIT) {
        existing.credit += Number(entry.amount);
      } else {
        existing.debit += Number(entry.amount);
      }
      trendsMap.set(dateStr, existing);
    }

    const ledgerTrends = Array.from(trendsMap.entries()).map(([date, vals]) => ({
      date,
      credit: vals.credit,
      debit: vals.debit,
    }));

    // 4. Income Categories Breakdown
    const incomeBreakdown = [
      { name: "Donations", value: totalDonationsSum },
      { name: "Pooja Bookings", value: totalPoojaSales },
      { name: "Room Stays", value: totalRoomSales },
    ];

    // 5. Expenses Breakdown by Category
    const debitsList = await db.ledgerEntry.findMany({
      where: { templeId: temple.id, entryType: LedgerEntryType.DEBIT },
      select: { category: true, amount: true },
    });
    const expenseMap = new Map<string, number>();
    for (const deb of debitsList) {
      const existing = expenseMap.get(deb.category) || 0;
      expenseMap.set(deb.category, existing + Number(deb.amount));
    }
    const expenseBreakdown = Array.from(expenseMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    // 6. Devotees by City
    const devotees = await db.devotee.findMany({
      where: { templeId: temple.id },
      select: { city: true },
    });
    const cityMap = new Map<string, number>();
    for (const dev of devotees) {
      const city = dev.city || "Unknown";
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    }
    const devoteeCityStats = Array.from(cityMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 7. Devotees by Source
    const sourceMap = new Map<string, number>();
    const sourceKeys: DevoteeSource[] = ["WEBSITE", "WHATSAPP", "WALKIN", "PHONE", "IMPORT"];
    sourceKeys.forEach(k => sourceMap.set(k, 0));

    const devoteesWithSource = await db.devotee.findMany({
      where: { templeId: temple.id },
      select: { source: true },
    });
    for (const dev of devoteesWithSource) {
      sourceMap.set(dev.source, (sourceMap.get(dev.source) || 0) + 1);
    }
    const devoteeSourceStats = Array.from(sourceMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    return res.json({
      auditLogs: auditLogsMapped,
      ledgerTrends,
      incomeBreakdown,
      expenseBreakdown,
      devoteeCityStats,
      devoteeSourceStats,
      summaryMetrics: {
        avgDonation,
        avgDevoteeValue,
        totalPoojaSales,
        totalRoomSales,
      },
    });
  } catch (error: any) {
    console.error("Reports aggregation failed:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
