import crypto from "crypto";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function createRazorpayOrder(amount: number, receiptId: string): Promise<RazorpayOrder> {
  const isStub = process.env.DEV_STUB_INTEGRATIONS === "true";
  
  if (isStub) {
    console.log(`[STUB PAYMENTS] Creating mock Razorpay order for amount ₹${amount}, receiptId: ${receiptId}`);
    return {
      id: `order_mock_${crypto.randomBytes(8).toString("hex")}`,
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: receiptId,
      status: "created",
    };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay API credentials not configured in environmental variables.");
  }

  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency: "INR",
        receipt: receiptId,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Razorpay API responded with ${res.status}: ${errText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw error;
  }
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const isStub = process.env.DEV_STUB_INTEGRATIONS === "true";
  if (isStub && orderId.startsWith("order_mock_")) {
    return true; // Stub order verification passes automatically
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.warn("Razorpay Webhook secret missing, signature verification bypassed in dev mode.");
    return false;
  }

  const generated = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generated === signature;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const isStub = process.env.DEV_STUB_INTEGRATIONS === "true";
  if (isStub) return true; // Bypass signature validation during mock runs

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(payload);
  const digest = shasum.digest("hex");

  return digest === signature;
}
