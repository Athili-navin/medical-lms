"use client";

import { Radio, Megaphone, GraduationCap, Bell } from "lucide-react";
import type { Announcement } from "@/types";
import { cn } from "@/lib/utils";

interface AnnouncementTickerProps {
  announcements: Announcement[];
  className?: string;
}

const typeIcons = {
  live: Radio,
  update: Megaphone,
  exam: GraduationCap,
  general: Bell,
};

const typeColors = {
  live: "text-red-500",
  update: "text-medical-500",
  exam: "text-amber-500",
  general: "text-blue-500",
};

export function AnnouncementTicker({ announcements, className }: AnnouncementTickerProps) {
  const items = [...announcements, ...announcements];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-medical-200/50 bg-medical-50/80 py-2 dark:border-medical-800/50 dark:bg-medical-950/30",
        className
      )}
      aria-live="polite"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((announcement, index) => {
          const Icon = typeIcons[announcement.type];
          return (
            <span key={`${announcement.id}-${index}`} className="mx-8 inline-flex items-center gap-2 text-sm">
              <Icon className={cn("h-4 w-4 shrink-0", typeColors[announcement.type])} />
              <span className="font-medium">{announcement.message}</span>
              <span className="text-muted-foreground">•</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
