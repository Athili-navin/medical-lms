import type { User } from "@/types";

export type SubscriptionPlanId = "yearly" | "monthly" | "none";

export function normalizeSubscriptionPlan(plan?: string | null): SubscriptionPlanId {
  if (plan === "yearly" || plan === "monthly") return plan;
  return "none";
}

export function hasActiveSubscription(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "tutor") return true;
  if (user.subscriptionExempt) return true;

  const plan = normalizeSubscriptionPlan(user.subscriptionPlan);
  if (plan === "none") return false;
  if (!user.subscriptionExpiry) return false;

  return new Date(user.subscriptionExpiry).getTime() > Date.now();
}

export function subscriptionExpiryFromNow(): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 365);
  return expiry.toISOString();
}
