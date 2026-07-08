"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { useProgressStore } from "@/stores";
import type { Chapter } from "@/types";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChapterCardProps {
  chapter: Chapter;
  href: string;
  isActive?: boolean;
  compact?: boolean;
}

export function ChapterCard({ chapter, href, isActive, compact }: ChapterCardProps) {
  const isCompleted = useProgressStore((s) => s.isCompleted(chapter.id)) || chapter.isCompleted;

  if (compact) {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
          isActive && "bg-accent font-medium text-accent-foreground"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{chapter.title}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md border p-3 transition-all hover:border-primary/50 hover:bg-accent/50",
        isActive && "border-primary bg-accent/50",
        isCompleted && "border-primary/30"
      )}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
      ) : (
        <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{chapter.title}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDuration(chapter.duration)}
        </div>
      </div>
    </Link>
  );
}
