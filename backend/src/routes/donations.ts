import { Router } from "express";
import { db } from "../lib/db";
import { generateReceiptNo, generateReceiptPdf } from "../lib/receipt";
import { sendWhatsAppMessage } from "../lib/whatsapp";
import { sendReceiptEmail } from "../lib/email";
import { createRazorpayOrder, verifyRazorpaySignature } from "../lib/payments";
import { DevoteeSource, DonationStatus, LedgerEntryType, PaymentStatus, PaymentType, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole, getCurrentUser } from "../lib/auth";

const router = Router();

const donationSchema = z.object({
  donorName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  amount: z.number().min(1),
  purpose: z.string().optional().default("General Development"),
  notes: z.string().optional(),
});

// --- PUBLIC ENDPOINTS ---

// Dynamic PDF Receipt Generator & Streamer
router.get("/receipts/:receiptNo.pdf", async (req, res) => {
  try {
    const { receiptNo } = req.params;
    // Find donation record
    const donation = await db.donation.findUnique({
      where: { receiptNo },
    });

    if (!donation) {
      return res.status(404).send("Receipt not found");
    }

    const pdfBuffer = await generateReceiptPdf(
      donation.receiptNo,
      donation.donorName,
      donation.phone,
      Number(donation.amount),
      donation.purpose || "General Development",
      donation.createdAt
    );

    res.contentType("application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="receipt_${receiptNo}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Failed to generate PDF on-the-fly:", error);
    return res.status(500).send("Error generating receipt PDF");
  }
});

// Online donation order
router.post("/online-order", async (req, res) => {
  try {
    const { amount, donorName, phone, email, purpose } = req.body;
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found in database");

    const tempReceiptId = `temp_don_${Date.now()}`;
    const order = await createRazorpayOrder(Number(amount), tempReceiptId);

    await db.payment.create({
      data: {
        templeId: temple.id,
        provider: "razorpay",
        providerOrderId: order.id,
        amount,
        currency: "INR",
        status: PaymentStatus.PENDING,
        type: PaymentType.DONATION,
        referenceId: tempReceiptId,
        raw: { donorName, phone, email: email || "", purpose: purpose || "General Development" },
      },
    });

    return res.json({ success: true, order });
  } catch (error: any) {
    console.error("Failed to create online order:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Verify online payment
router.post("/verify", async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      donorName,
      phone,
      email,
      purpose,
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
      const existing = await db.donation.findFirst({
        where: { paymentId: payment.providerPaymentId },
      });
      if (existing) {
        return res.json({ success: true, donation: { ...existing, amount: existing.amount.toString() } });
      }
    }

    let devotee = await db.devotee.findFirst({
      where: { templeId: temple.id, phone },
    });

    if (!devotee) {
      devotee = await db.devotee.create({
        data: {
          templeId: temple.id,
          name: donorName,
          phone,
          email: email || null,
          source: DevoteeSource.WEBSITE,
          consentWhatsapp: true,
          totalDonations: 0,
        },
      });
    }

    const receiptNo = await generateReceiptNo();
    const date = new Date();

    const donation = await db.donation.create({
      data: {
        templeId: temple.id,
        devoteeId: devotee.id,
        donorName,
        phone,
        email: email || null,
        amount: Number(amount),
        purpose: purpose || "General Development",
        status: DonationStatus.SUCCESS,
        receiptNo,
        receiptPdfUrl: `/api/donations/receipts/${receiptNo}.pdf`,
        paymentId,
        createdAt: date,
      },
    });

    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          providerPaymentId: paymentId,
          signature,
          referenceId: donation.id,
        },
      });
    }

    await db.devotee.update({
      where: { id: devotee.id },
      data: {
        totalDonations: { increment: Number(amount) },
        lastInteractionAt: date,
      },
    });

    await db.ledgerEntry.create({
      data: {
        templeId: temple.id,
        entryType: LedgerEntryType.CREDIT,
        category: "Donation",
        amount: Number(amount),
        source: "WEBSITE",
        referenceType: "Donation",
        referenceId: donation.id,
        date,
        note: `Online Donation: ${purpose || "General Development"} (Receipt #${receiptNo})`,
        createdBy: "SYSTEM",
        createdAt: date,
      },
    });

    const pdfBuffer = await generateReceiptPdf(
      receiptNo,
      donorName,
      phone,
      Number(amount),
      purpose || "General Development",
      date
    );

    const whatsappMsgText = `Dear ${donorName}, Shri Mallikarjun Devasthan, Nhavre acknowledges receipt of your online donation of ₹${new Intl.NumberFormat("en-IN").format(amount)} for ${purpose || "General Development"}. Receipt No: ${receiptNo}. Thank you for your contribution.`;
    await sendWhatsAppMessage(phone, whatsappMsgText);

    if (email) {
      await sendReceiptEmail({
        to: email,
        donorName,
        receiptNo,
        amount: Number(amount),
        purpose: purpose || "General Development",
        pdfBuffer,
      });
    }

    return res.json({ success: true, donation: { ...donation, amount: donation.amount.toString() } });
  } catch (error: any) {
    console.error("Failed to verify online payment:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to process payment callback" });
  }
});

// --- ADMIN STAFF PROTECTED ENDPOINTS ---

router.use(requireRole([Role.SUPER_ADMIN, Role.TRUST_ADMIN, Role.STAFF]));

// Fetch all donations
router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) return res.json([]);

    const donations = await db.donation.findMany({
      where: {
        templeId: temple.id,
        OR: search ? [
          { donorName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { receiptNo: { contains: search, mode: "insensitive" } },
        ] : undefined,
      },
      include: {
        devotee: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = donations.map(d => ({
      ...d,
      amount: d.amount.toString(),
      devotee: d.devotee ? { ...d.devotee, totalDonations: d.devotee.totalDonations.toString() } : null
    }));

    return res.json(serialized);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create counter donation
router.post("/", async (req, res) => {
  try {
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (!temple) throw new Error("No temple found");

    const val = donationSchema.parse(req.body);

    let devotee = await db.devotee.findFirst({
      where: { templeId: temple.id, phone: val.phone },
    });

    if (!devotee) {
      devotee = await db.devotee.create({
        data: {
          templeId: temple.id,
          name: val.donorName,
          phone: val.phone,
          email: val.email || null,
          source: DevoteeSource.WALKIN,
          consentWhatsapp: true,
          totalDonations: 0,
        },
      });
    }

    const receiptNo = await generateReceiptNo();
    const date = new Date();

    const donation = await db.donation.create({
      data: {
        templeId: temple.id,
        devoteeId: devotee.id,
        donorName: val.donorName,
        phone: val.phone,
        email: val.email || null,
        amount: val.amount,
        purpose: val.purpose,
        status: DonationStatus.SUCCESS,
        receiptNo,
        receiptPdfUrl: `/api/donations/receipts/${receiptNo}.pdf`,
        paymentId: "counter_cash",
      },
    });

    await db.devotee.update({
      where: { id: devotee.id },
      data: {
        totalDonations: { increment: val.amount },
        lastInteractionAt: date,
      },
    });

    await db.ledgerEntry.create({
      data: {
        templeId: temple.id,
        entryType: LedgerEntryType.CREDIT,
        category: "Donation",
        amount: val.amount,
        source: "COUNTER",
        referenceType: "Donation",
        referenceId: donation.id,
        date,
        note: `Counter Cash Donation: ${val.purpose} (Receipt #${receiptNo})`,
        createdBy: "SYSTEM",
      },
    });

    const pdfBuffer = await generateReceiptPdf(
      receiptNo,
      val.donorName,
      val.phone,
      val.amount,
      val.purpose,
      date
    );

    const whatsappMsgText = `Dear ${val.donorName}, Shri Mallikarjun Devasthan, Nhavre acknowledges receipt of your donation of ₹${new Intl.NumberFormat("en-IN").format(val.amount)} for ${val.purpose}. Receipt No: ${receiptNo}. Thank you for your contribution.`;
    await sendWhatsAppMessage(val.phone, whatsappMsgText);

    if (val.email) {
      await sendReceiptEmail({
        to: val.email,
        donorName: val.donorName,
        receiptNo,
        amount: val.amount,
        purpose: val.purpose,
        pdfBuffer,
      });
    }

    return res.json({ success: true, donation: { ...donation, amount: donation.amount.toString() } });
  } catch (error: any) {
    console.error("Counter donation creation failed:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to create donation record" });
  }
});

export default router;
