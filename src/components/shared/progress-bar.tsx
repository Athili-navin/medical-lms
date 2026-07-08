"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({ value, className, showLabel = true, size = "md" }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-primary">{clampedValue}%</span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-secondary", heights[size])}>
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-medical-500 to-medical-400 transition-all duration-500", heights[size])}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
