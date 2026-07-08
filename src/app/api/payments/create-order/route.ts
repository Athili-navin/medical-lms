import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay/server";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription/plans";
import type { BillingInterval } from "@/lib/subscription/plans";

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("student");
  if ("error" in auth && auth.error) return auth.error;

  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  const plan = body.plan as BillingInterval;
  if (plan !== "yearly") {
    return apiError("Invalid plan.", 400);
  }

  const config = SUBSCRIPTION_PLANS.yearly;
  const keyId = getRazorpayKeyId();
  if (!keyId) return apiError("Razorpay key is not configured", 503);

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: config.amountInPaise,
      currency: "INR",
      receipt: `sub_${auth.user!.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: auth.user!.id,
        plan,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      plan,
      planName: config.name,
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Could not create payment order", 500);
  }
}
