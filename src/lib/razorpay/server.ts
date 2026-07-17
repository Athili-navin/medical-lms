import Razorpay from "razorpay";

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** Server-only — returned to the client via /api/payments/create-order (never use NEXT_PUBLIC_*). */
export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID || "";
}
