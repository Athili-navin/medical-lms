"use client";

import { Mail, Calendar, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import type { User } from "@/types";
import { formatDate } from "@/lib/utils";

interface ProfileCardProps {
  user: User;
  overallProgress?: number;
}

export function ProfileCard({ user, overallProgress = 0 }: ProfileCardProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="mx-auto h-24 w-24">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <CardTitle className="mt-4">{user.name}</CardTitle>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          {user.email}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-accent/50 p-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="font-medium capitalize">{user.subscriptionPlan} Plan</span>
          </div>
          {user.subscriptionExpiry && (
            <Badge variant="outline">Until {formatDate(user.subscriptionExpiry)}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Member since {formatDate(user.joinedAt)}
        </div>
        <ProgressBar value={overallProgress} />
      </CardContent>
    </Card>
  );
}
