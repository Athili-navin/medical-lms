"use client";

import { type RefObject, useEffect, useState } from "react";

const BLOCKED_KEYS = new Set(["c", "s", "p", "a", "u"]);

function shouldBlockShortcut(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  const withMod = event.ctrlKey || event.metaKey;
  if (!withMod) return false;
  if (event.shiftKey && (key === "i" || key === "j" || key === "c")) return true;
  return BLOCKED_KEYS.has(key);
}

/** Block copy/print shortcuts while protected content is open. */
export function useContentProtection(
  active: boolean,
  containerRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!active) return;

    const container = containerRef?.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (shouldBlockShortcut(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onCopy = (event: ClipboardEvent) => {
      event.preventDefault();
    };

    const onCut = (event: ClipboardEvent) => {
      event.preventDefault();
    };

    const onDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown, true);
    const copyTarget = container ?? document;
    copyTarget.addEventListener("copy", onCopy as EventListener, true);
    copyTarget.addEventListener("cut", onCut as EventListener, true);
    copyTarget.addEventListener("dragstart", onDragStart as EventListener, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      copyTarget.removeEventListener("copy", onCopy as EventListener, true);
      copyTarget.removeEventListener("cut", onCut as EventListener, true);
      copyTarget.removeEventListener("dragstart", onDragStart as EventListener, true);
    };
  }, [active, containerRef]);
}

/** Video player overlay when tab loses focus — separate from PDF modal protection. */
export function useVisibilityProtection(active: boolean) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setIsBlocked(false);
      setBlockReason(null);
      return;
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        setIsBlocked(true);
        setBlockReason("Return to this tab to continue viewing protected content.");
      } else {
        setIsBlocked(false);
        setBlockReason(null);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [active]);

  return { isBlocked, blockReason };
}
