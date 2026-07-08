"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { GraduationCap, Loader2, CheckCircle2 } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError("");
    const { error: resetError } = await requestPasswordReset(data.email);
    setIsLoading(false);
    if (resetError) {
      setError(resetError);
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <PublicHeader />
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl gradient-medical">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="mt-4">Reset Password</CardTitle>
              <CardDescription>
                {sent ? "Check your email for reset instructions" : "Enter your email to receive a reset link"}
              </CardDescription>
            </CardHeader>
            {sent ? (
              <CardContent className="pb-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">
                  We&apos;ve sent password reset instructions to your email address.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/login">Back to Login</Link>
                </Button>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                  <Link href="/login" className="text-center text-sm text-primary hover:underline">
                    Back to Login
                  </Link>
                </CardFooter>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
