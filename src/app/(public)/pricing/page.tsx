"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { SubscriptionCard } from "@/components/shared/subscription-card";
import { subscriptionPlansList } from "@/lib/subscription/plans";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { useState } from "react";

export default function PricingPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { checkout } = useRazorpayCheckout();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/signup");
      return;
    }
    const plan = subscriptionPlansList.find((p) => p.id === planId);
    if (!plan) return;
    setLoadingPlan(planId);
    try {
      await checkout(plan.interval);
      router.push("/dashboard/courses");
    } catch {
      /* cancelled or failed — card shows error on subscription page */
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold">Yearly Access — ₹2,000</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              One simple plan. Full access to all courses for 12 months. Pay securely with Razorpay.
            </p>
          </motion.div>
          <div className="mx-auto mt-16 max-w-md">
            {subscriptionPlansList.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={user?.subscriptionPlan === plan.interval}
                onSubscribe={handleSubscribe}
                loading={loadingPlan === plan.id}
              />
            ))}
          </div>
          {!user && (
            <p className="mt-12 text-center text-sm text-muted-foreground">
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>{" "}
              first, then subscribe from your dashboard.
            </p>
          )}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
