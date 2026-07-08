"use client";

import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SubscriptionPlan } from "@/types";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  onSubscribe?: (planId: string) => void;
  isCurrentPlan?: boolean;
  loading?: boolean;
  className?: string;
}

export function SubscriptionCard({
  plan,
  onSubscribe,
  isCurrentPlan,
  loading,
  className,
}: SubscriptionCardProps) {
  const symbol = plan.currency === "INR" ? "₹" : "$";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn("h-full", className)}
    >
      <Card
        className={cn(
          "relative flex h-full flex-col",
          plan.popular && "border-primary shadow-lg shadow-primary/10"
        )}
      >
        {plan.popular && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
        )}
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>
            <span className="text-3xl font-bold text-foreground">
              {symbol}
              {plan.price.toLocaleString("en-IN")}
            </span>
            <span className="text-muted-foreground">/year</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant={plan.popular ? "default" : "outline"}
            disabled={isCurrentPlan || loading}
            onClick={() => onSubscribe?.(plan.id)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCurrentPlan ? "Current Plan" : "Subscribe with Razorpay"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
