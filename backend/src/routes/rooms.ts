import { Router } from "express";
import { db } from "../lib/db";
import { RoomBookingStatus, LedgerEntryType, PaymentStatus, PaymentType, DevoteeSource, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../lib/auth";
import { createRazorpayOrder, verifyRazorpaySignature } from "../lib/payments";
import { sendWhatsAppMessage } from "../lib/whatsapp";

const router = Router();

const roomSchema = z.object({
  name: z.string().min(1),
  roomType: z.string().min(2),
  capacity: z.number().int().min(1),
  pricePerNight: z.number().min(0),
  active: z.boolean().default(true),
});

const roomBookingSchema = z.object({
  devoteeId: z.string(),
  roomId: z.string(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guests: z.number().int().min(1),
  paymentId: z.string().optional(),
});

// --- PUBLIC ENDPOINTS ---

// Fetch Rooms
router.get("/", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const rooms = await db.room.findMany({
      where: { templeId: temple.id },
      orderBy: { name: "asc" },
    });
    const serialized = rooms.map(r => ({ ...r, pricePerNight: r.pricePerNight.toString() }));
    return res.json(serialized);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create online room booking order
router.post("/online-order", async (req, res) => {
  try {
    const { amount, roomId, checkIn, checkOut, guests } = req.body;
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found in database");

    const tempReceiptId = `temp_rm_${Date.now()}`;
    const order = await createRazorpayOrder(Number(amount), tempReceiptId);

    await db.payment.create({
      data: {
        templeId: temple.id,
        provider: "razorpay",
        providerOrderId: order.id,
        amount,
        currency: "INR",
        status: PaymentStatus.PENDING,
        type: PaymentType.ROOM,
        referenceId: tempReceiptId,
        raw: { roomId, checkIn: new Date(checkIn).toISOString(), checkOut: new Date(checkOut).toISOString(), guests },
      },
    });

    return res.json({ success: true, order });
  } catch (error: any) {
    console.error("Failed to create online room order:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Verify online room booking
router.post("/verify", async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      devoteeName,
      phone,
      email,
      roomId,
      checkIn,
      checkOut,
      guests,
      amount,
    } = req.body;

    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");

    const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
    if (!isValid) throw new Error("Payment signature verification failed");

    const payment = await db.payment.findUnique({
      where: { providerOrderId: orderId },
    });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (payment && payment.status === PaymentStatus.SUCCESS) {
      const existing = await db.roomBooking.findFirst({
        where: { paymentId: payment.providerPaymentId },
      });
      if (existing) {
        return res.json({ success: true, booking: { ...existing, amount: existing.amount.toString() } });
      }
    }

    const overlaps = await db.roomBooking.count({
      where: {
        roomId,
        status: { in: [RoomBookingStatus.CONFIRMED, RoomBookingStatus.PENDING] },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
    });

    if (overlaps > 0) {
      throw new Error(`Double-booking error! Room is already occupied during these dates.`);
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

    const booking = await db.roomBooking.create({
      data: {
        templeId: temple.id,
        devoteeId: devotee.id,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: Number(guests),
        amount: Number(amount),
        status: RoomBookingStatus.CONFIRMED,
        paymentId,
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
        category: "Room Booking",
        amount: Number(amount),
        source: "WEBSITE",
        referenceType: "RoomBooking",
        referenceId: booking.id,
        date: new Date(),
        note: `Online Room Booking (Payment ID: ${paymentId})`,
        createdBy: "SYSTEM",
      },
    });

    const room = await db.room.findUnique({ where: { id: roomId } });
    const roomName = room ? room.name : "Room";
    const whatsappMsgText = `Dear ${devoteeName}, your Bhakta Niwas room stay for ${roomName} is CONFIRMED. Check-in: ${checkInDate.toLocaleDateString("en-IN")}, Check-out: ${checkOutDate.toLocaleDateString("en-IN")}. Payment Ref: ${paymentId}. Thank you for booking.`;
    await sendWhatsAppMessage(phone, whatsappMsgText);

    return res.json({ success: true, booking: { ...booking, amount: booking.amount.toString() } });
  } catch (error: any) {
    console.error("Online room booking verification failed:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to process room booking transaction" });
  }
});

// --- PROTECTED ADMIN / STAFF ENDPOINTS ---

router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

// Fetch Room Bookings
router.get("/bookings", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);
    const bookings = await db.roomBooking.findMany({
      where: { templeId: temple.id },
      include: {
        devotee: true,
        room: true,
      },
      orderBy: { checkIn: "desc" },
    });

    const serialized = bookings.map(b => ({
      ...b,
      amount: b.amount.toString(),
      devotee: b.devotee ? { ...b.devotee, totalDonations: b.devotee.totalDonations.toString() } : null,
      room: b.room ? { ...b.room, pricePerNight: b.room.pricePerNight.toString() } : null,
    }));

    return res.json(serialized);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create counter room booking
router.post("/bookings", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");

    const val = roomBookingSchema.parse(req.body);

    const room = await db.room.findUnique({
      where: { id: val.roomId },
    });
    if (!room) throw new Error("Room not found");

    const overlaps = await db.roomBooking.count({
      where: {
        roomId: val.roomId,
        status: { in: [RoomBookingStatus.CONFIRMED, RoomBookingStatus.PENDING] },
        checkIn: { lt: val.checkOut },
        checkOut: { gt: val.checkIn },
      },
    });

    if (overlaps > 0) {
      throw new Error(`Double-booking error! Room is already occupied during these dates.`);
    }

    const diffTime = Math.abs(val.checkOut.getTime() - val.checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = Number(room.pricePerNight) * diffDays;

    const booking = await db.roomBooking.create({
      data: {
        templeId: temple.id,
        devoteeId: val.devoteeId,
        roomId: val.roomId,
        checkIn: val.checkIn,
        checkOut: val.checkOut,
        guests: val.guests,
        amount: totalAmount,
        status: RoomBookingStatus.CONFIRMED,
        paymentId: val.paymentId || "walkin_cash",
      },
    });

    await db.ledgerEntry.create({
      data: {
        templeId: temple.id,
        entryType: LedgerEntryType.CREDIT,
        category: "Room Booking",
        amount: totalAmount,
        source: "COUNTER",
        referenceType: "RoomBooking",
        referenceId: booking.id,
        date: new Date(),
        note: `Bhakta Niwas Room Booking: ${room.name} (${diffDays} nights)`,
        createdBy: "SYSTEM",
      },
    });

    return res.json({ success: true, booking: { ...booking, amount: booking.amount.toString() } });
  } catch (error: any) {
    console.error("Failed to book room:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to book room" });
  }
});

// Update Room Booking Status
router.put("/bookings/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await db.roomBooking.update({
      where: { id },
      data: { status: status as RoomBookingStatus },
    });

    return res.json({ success: true, booking: { ...booking, amount: booking.amount.toString() } });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "Failed to update status" });
  }
});

// Create Room Configuration
router.post("/", requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN]), async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");

    const val = roomSchema.parse(req.body);
    const room = await db.room.create({
      data: {
        ...val,
        templeId: temple.id,
      },
    });

    return res.json({ success: true, room: { ...room, pricePerNight: room.pricePerNight.toString() } });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "Failed to create" });
  }
});

// Update Room Configuration
router.put("/:id", requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const val = roomSchema.parse(req.body);
    const room = await db.room.update({
      where: { id: id as string },
      data: val,
    });

    return res.json({ success: true, room: { ...room, pricePerNight: room.pricePerNight.toString() } });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "Failed to update" });
  }
});

export default router;
