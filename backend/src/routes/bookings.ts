import { Router } from "express";
import { db } from "../lib/db";
import { BookingStatus, ServiceCategory, LedgerEntryType, PaymentStatus, PaymentType, DevoteeSource, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../lib/auth";
import { createRazorpayOrder, verifyRazorpaySignature } from "../lib/payments";
import { sendWhatsAppMessage } from "../lib/whatsapp";

const router = Router();

const serviceTypeSchema = z.object({
  name: z.string().min(2),
  category: z.nativeEnum(ServiceCategory),
  description: z.string().optional(),
  price: z.number().min(0),
  slotCapacity: z.number().int().min(1),
  durationMin: z.number().int().optional(),
  active: z.boolean().default(true),
});

const bookingSchema = z.object({
  devoteeId: z.string(),
  serviceTypeId: z.string(),
  date: z.coerce.date(),
  slotLabel: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().optional(),
  paymentId: z.string().optional(),
});

// --- PUBLIC ENDPOINTS ---

// Fetch Service Types for booking page
router.get("/service-types", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const services = await db.serviceType.findMany({
      where: { templeId: temple.id },
      orderBy: { createdAt: "desc" },
    });
    const serialized = services.map(s => ({ ...s, price: s.price.toString() }));
    return res.json(serialized);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create online booking order
router.post("/online-order", async (req, res) => {
  try {
    const { amount, serviceTypeId, date, slotLabel } = req.body;
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found in database");

    const tempReceiptId = `temp_bk_${Date.now()}`;
    const order = await createRazorpayOrder(Number(amount), tempReceiptId);

    await db.payment.create({
      data: {
        templeId: temple.id,
        provider: "razorpay",
        providerOrderId: order.id,
        amount,
        currency: "INR",
        status: PaymentStatus.PENDING,
        type: PaymentType.BOOKING,
        referenceId: tempReceiptId,
        raw: { serviceTypeId, date: new Date(date).toISOString(), slotLabel: slotLabel || "" },
      },
    });

    return res.json({ success: true, order });
  } catch (error: any) {
    console.error("Failed to create online booking order:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Verify online booking payment
router.post("/verify", async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      devoteeName,
      phone,
      email,
      serviceTypeId,
      date,
      slotLabel,
      quantity,
      notes,
      amount,
    } = req.body;

    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");

    const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
    if (!isValid) throw new Error("Payment signature verification failed");

    const payment = await db.payment.findUnique({
      where: { providerOrderId: orderId },
    });

    if (payment && payment.status === PaymentStatus.SUCCESS) {
      const existing = await db.booking.findFirst({
        where: { paymentId: payment.providerPaymentId },
      });
      if (existing) {
        return res.json({ success: true, booking: { ...existing, amount: existing.amount.toString() } });
      }
    }

    let devotee = await db.devotee.findFirst({
      where: { templeId: temple.id, phone },
    });

    if (!devotee) {
      devotee = await db.devotee.create({
        data: {
          templeId: temple.id,
          name: devoteeName,
          phone,
          email: email || null,
          source: DevoteeSource.WEBSITE,
          consentWhatsapp: true,
          totalDonations: 0,
        },
      });
    }

    const bookingDate = new Date(date);
    const booking = await db.booking.create({
      data: {
        templeId: temple.id,
        devoteeId: devotee.id,
        serviceTypeId,
        date: bookingDate,
        slotLabel: slotLabel || null,
        quantity: Number(quantity),
        amount: Number(amount),
        status: BookingStatus.CONFIRMED,
        paymentId,
        notes: notes || null,
      },
    });

    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          providerPaymentId: paymentId,
          signature,
          referenceId: booking.id,
        },
      });
    }

    await db.ledgerEntry.create({
      data: {
        templeId: temple.id,
        entryType: LedgerEntryType.CREDIT,
        category: "Booking",
        amount: Number(amount),
        source: "WEBSITE",
        referenceType: "Booking",
        referenceId: booking.id,
        date: new Date(),
        note: `Online Pooja Booking (Payment ID: ${paymentId})`,
        createdBy: "SYSTEM",
      },
    });

    const service = await db.serviceType.findUnique({ where: { id: serviceTypeId } });
    const serviceName = service ? service.name : "Pooja";
    const whatsappMsgText = `Dear ${devoteeName}, your Pooja Booking for ${serviceName} is CONFIRMED. Date: ${bookingDate.toLocaleDateString("en-IN")}. Quantity: ${quantity}. Payment Ref: ${paymentId}. Thank you for booking.`;
    await sendWhatsAppMessage(phone, whatsappMsgText);

    return res.json({ success: true, booking: { ...booking, amount: booking.amount.toString() } });
  } catch (error: any) {
    console.error("Online booking verification failed:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to process booking verification callback" });
  }
});

// --- ADMIN / STAFF PROTECTED ENDPOINTS ---

router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

// Fetch all bookings with filters
router.get("/", async (req, res) => {
  try {
    const { serviceTypeId, date, status } = req.query;
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);

    const whereClause: any = { templeId: temple.id };
    if (serviceTypeId) whereClause.serviceTypeId = serviceTypeId as string;
    if (status) whereClause.status = status as BookingStatus;
    if (date) {
      const filterDate = new Date(date as string);
      const startOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 0, 0, 0);
      const endOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 23, 59, 59);
      whereClause.date = { gte: startOfDay, lte: endOfDay };
    }

    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        devotee: true,
        serviceType: true,
      },
      orderBy: { date: "desc" },
    });

    const serialized = bookings.map(b => ({
      ...b,
      amount: b.amount.toString(),
      devotee: b.devotee ? { ...b.devotee, totalDonations: b.devotee.totalDonations.toString() } : null,
      serviceType: b.serviceType ? { ...b.serviceType, price: b.serviceType.price.toString() } : null,
    }));

    return res.json(serialized);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create counter booking
router.post("/", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");

    const val = bookingSchema.parse(req.body);

    const service = await db.serviceType.findUnique({
      where: { id: val.serviceTypeId },
    });
    if (!service) throw new Error("Service type not found");

    const startOfDay = new Date(val.date.getFullYear(), val.date.getMonth(), val.date.getDate(), 0, 0, 0);
    const endOfDay = new Date(val.date.getFullYear(), val.date.getMonth(), val.date.getDate(), 23, 59, 59);

    const existingBookingsCount = await db.booking.aggregate({
      where: {
        serviceTypeId: val.serviceTypeId,
        date: { gte: startOfDay, lte: endOfDay },
        slotLabel: val.slotLabel,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      },
      _sum: {
        quantity: true,
      },
    });

    const bookedQty = existingBookingsCount._sum.quantity || 0;
    if (bookedQty + val.quantity > service.slotCapacity) {
      throw new Error(`Overbooked! Only ${service.slotCapacity - bookedQty} slots remaining for this service/date.`);
    }

    const totalAmount = Number(service.price) * val.quantity;
    const booking = await db.booking.create({
      data: {
        templeId: temple.id,
        devoteeId: val.devoteeId,
        serviceTypeId: val.serviceTypeId,
        date: val.date,
        slotLabel: val.slotLabel || null,
        quantity: val.quantity,
        amount: totalAmount,
        status: BookingStatus.CONFIRMED,
        paymentId: val.paymentId || "walkin_cash",
        notes: val.notes || null,
      },
    });

    await db.ledgerEntry.create({
      data: {
        templeId: temple.id,
        entryType: LedgerEntryType.CREDIT,
        category: "Booking",
        amount: totalAmount,
        source: "COUNTER",
        referenceType: "Booking",
        referenceId: booking.id,
        date: new Date(),
        note: `Counter Pooja Booking: ${service.name} (Qty: ${val.quantity})`,
        createdBy: "SYSTEM",
      },
    });

    return res.json({ success: true, booking: { ...booking, amount: booking.amount.toString() } });
  } catch (error: any) {
    console.error("Failed to book service:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to book" });
  }
});

// Update Booking Status
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await db.booking.update({
      where: { id },
      data: { status: status as BookingStatus },
      include: { serviceType: true },
    });

    return res.json({ success: true, booking: { ...booking, amount: booking.amount.toString() } });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "Failed to update status" });
  }
});

// Create Service Type
router.post("/service-types", requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN]), async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");

    const val = serviceTypeSchema.parse(req.body);
    const service = await db.serviceType.create({
      data: {
        ...val,
        templeId: temple.id,
      },
    });

    return res.json({ success: true, service: { ...service, price: service.price.toString() } });
  } catch (error: any) {
    console.error("Failed to create service:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to create" });
  }
});

// Update Service Type
router.put("/service-types/:id", requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const val = serviceTypeSchema.parse(req.body);
    const service = await db.serviceType.update({
      where: { id: id as string },
      data: val,
    });

    return res.json({ success: true, service: { ...service, price: service.price.toString() } });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "Failed to update" });
  }
});

export default router;
