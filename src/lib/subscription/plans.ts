import type { SubscriptionPlan } from "@/types";

export type BillingInterval = "yearly";

export const YEARLY_PLAN = {
  amountInPaise: 200000, // ₹2,000
  durationDays: 365,
  name: "Yearly Access",
} as const;

export const SUBSCRIPTION_PLANS: Record<BillingInterval, typeof YEARLY_PLAN> = {
  yearly: YEARLY_PLAN,
};

export const subscriptionPlansList: SubscriptionPlan[] = [
  {
    id: "plan-yearly",
    name: "Yearly Access",
    price: 2000,
    currency: "INR",
    interval: "yearly",
    popular: true,
    features: [
      "Full access to all courses for 1 year",
      "HD video lectures",
      "Rich chapter notes",
      "Personal notes editor",
      "Progress tracking",
      "Keyword tooltips with images",
      "Email support",
    ],
  },
];
