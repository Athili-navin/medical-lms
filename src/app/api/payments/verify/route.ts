import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireAuth, apiError, mapProfile } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { getRazorpayClient } from "@/lib/razorpay/server";
import { subscriptionExpiryFromNow } from "@/lib/subscription/access";

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("student");
  if ("error" in auth && auth.error) return auth.error;

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    plan?: string;
  };

  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
    return apiError("Missing payment details", 400);
  }
  if (plan !== "yearly") {
    return apiError("Invalid plan", 400);
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return apiError("Razorpay is not configured", 503);

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return apiError("Payment verification failed", 400);
  }

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (order.notes?.userId !== auth.user!.id) {
      return apiError("Order does not belong to this user", 403);
    }
    if (order.notes?.plan !== plan) {
      return apiError("Plan mismatch", 400);
    }

    const expiry = subscriptionExpiryFromNow();
    const { data: profile, error } = await auth.supabase!
      .from("profiles")
      .update({
        subscription_plan: plan,
        subscription_expiry: expiry,
      })
      .eq("id", auth.user!.id)
      .select("*")
      .single();

    if (error || !profile) return apiError(error?.message ?? "Could not update subscription", 500);

    return NextResponse.json({
      success: true,
      user: mapProfile(profile),
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Payment verification failed", 500);
  }
}
