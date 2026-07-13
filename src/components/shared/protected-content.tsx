"use client";

import { type ReactNode, useRef } from "react";
import { useContentProtection } from "@/hooks/use-content-protection";
import { cn } from "@/lib/utils";

interface ProtectedContentProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
}

/** Wraps student-facing content to block copy, cut, and text selection. */
export function ProtectedContent({ children, className, active = true }: ProtectedContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useContentProtection(active, containerRef);

  return (
    <div
      ref={containerRef}
      className={cn("protected-content", className)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
