"use client";

import { useState, type ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FullscreenPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function FullscreenPanel({ title, children, className, contentClassName }: FullscreenPanelProps) {
  const [fullscreen, setFullscreen] = useState(false);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button size="sm" variant="outline" onClick={() => setFullscreen(false)}>
            <Minimize2 className="mr-1 h-4 w-4" />
            Exit Fullscreen
          </Button>
        </div>
        <div className={cn("flex-1 overflow-y-auto p-4", contentClassName)}>{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="mb-2 flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1 text-xs"
          onClick={() => setFullscreen(true)}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Fullscreen
        </Button>
      </div>
      {children}
    </div>
  );
}
