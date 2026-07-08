"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Video, StickyNote, BarChart3, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionCard } from "@/components/shared/subscription-card";
import { subscriptionPlansList } from "@/lib/subscription/plans";

const features = [
  { icon: BookOpen, title: "Structured Curriculum", description: "Courses with lessons and chapters designed by medical experts." },
  { icon: Video, title: "HD Video Lectures", description: "High-quality video content covering every topic in depth." },
  { icon: StickyNote, title: "Personal Notes", description: "Capture study insights alongside course material." },
  { icon: BarChart3, title: "Progress Tracking", description: "Visual dashboards to keep you motivated and on track." },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-medical-50 via-background to-teal-50 dark:from-medical-950/30 dark:via-background dark:to-teal-950/20" />
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Premium medical education
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Master Medicine with{" "}
                <span className="text-gradient-medical">Expert-Led</span> Courses
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Structured lessons, HD videos, rich chapter notes, and personal study tools — built for dental and general medicine students.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/#pricing">View Pricing</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop"
                  alt="Medical students learning"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything You Need to Succeed</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A complete learning ecosystem designed for medical professionals and students.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div key={feature.title} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-muted-foreground">₹2,000 per year — full access to all courses.</p>
          </motion.div>
          <div className="mx-auto mt-12 max-w-md">
            {subscriptionPlansList.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                onSubscribe={() => {
                  window.location.href = "/signup";
                }}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="link" asChild>
              <Link href="/pricing">View full pricing details →</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl gradient-medical p-8 text-center text-white lg:p-16">
            <h2 className="text-3xl font-bold">Ready to Start Learning?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Create your account and subscribe to unlock all courses on ENAMEL ROADS.
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
