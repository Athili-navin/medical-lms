"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SubscriptionCard } from "@/components/shared/subscription-card";
import { subscriptionPlansList } from "@/lib/subscription/plans";
import { hasActiveSubscription } from "@/lib/subscription/access";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { useAuthStore } from "@/stores";

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const { checkout } = useRazorpayCheckout();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubscribe = async (planId: string) => {
    const plan = subscriptionPlansList.find((p) => p.id === planId);
    if (!plan) return;

    setError("");
    setLoadingPlan(planId);
    try {
      await checkout(plan.interval);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  const active = hasActiveSubscription(user);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">Subscription</h1>
        <p className="text-muted-foreground">
          {user?.subscriptionExempt ? (
            <>Testing account — full access without a paid subscription.</>
          ) : active ? (
            <>
              Active plan:{" "}
              <span className="font-medium capitalize text-foreground">{user?.subscriptionPlan}</span>
              {user?.subscriptionExpiry && (
                <> — valid until {new Date(user.subscriptionExpiry).toLocaleDateString("en-IN")}</>
              )}
            </>
          ) : (
            <>Subscribe for ₹2,000/year to access all courses. Payments via Razorpay (INR).</>
          )}
        </p>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </motion.div>
      <div className="mx-auto max-w-md">
        {subscriptionPlansList.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={active && user?.subscriptionPlan === plan.interval}
            onSubscribe={handleSubscribe}
            loading={loadingPlan === plan.id}
          />
        ))}
      </div>
    </div>
  );
}
