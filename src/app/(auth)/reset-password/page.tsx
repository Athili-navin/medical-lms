"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { GraduationCap, Loader2 } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { establishRecoverySession, setPasswordFromReset } from "@/lib/auth-recovery";
import { useRouter } from "next/navigation";

const schema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const result = await establishRecoverySession();
      if (cancelled) return;
      setSessionReady(result.ready);
      if (!result.ready && result.error) setError(result.error);
      setIsCheckingSession(false);
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError("");
    const { error: updateError } = await setPasswordFromReset(data.newPassword);
    setIsLoading(false);
    if (updateError) {
      setError(updateError);
      return;
    }
    router.push("/login");
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
              <CardTitle className="mt-4">Set New Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>

            {isCheckingSession ? (
              <CardContent className="flex flex-col items-center gap-3 pb-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
              </CardContent>
            ) : !sessionReady ? (
              <CardContent className="space-y-4 pb-6 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button asChild>
                  <Link href="/forgot-password">Request New Reset Link</Link>
                </Button>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" {...register("newPassword")} />
                    {errors.newPassword && (
                      <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
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
