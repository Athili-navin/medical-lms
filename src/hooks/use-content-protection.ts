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

    const onSelectStart = (event: Event) => {
      event.preventDefault();
    };

    const onContextMenu = (event: Event) => {
      event.preventDefault();
    };

    const onTouchStart = (event: Event) => {
      const touchEvent = event as TouchEvent;
      if (touchEvent.touches.length > 1) touchEvent.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown, true);
    const copyTarget = container ?? document;
    copyTarget.addEventListener("copy", onCopy as EventListener, true);
    copyTarget.addEventListener("cut", onCut as EventListener, true);
    copyTarget.addEventListener("dragstart", onDragStart as EventListener, true);
    copyTarget.addEventListener("selectstart", onSelectStart, true);
    copyTarget.addEventListener("contextmenu", onContextMenu, true);
    copyTarget.addEventListener("touchstart", onTouchStart, { capture: true, passive: false });

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      copyTarget.removeEventListener("copy", onCopy as EventListener, true);
      copyTarget.removeEventListener("cut", onCut as EventListener, true);
      copyTarget.removeEventListener("dragstart", onDragStart as EventListener, true);
      copyTarget.removeEventListener("selectstart", onSelectStart, true);
      copyTarget.removeEventListener("contextmenu", onContextMenu, true);
      copyTarget.removeEventListener("touchstart", onTouchStart, true);
    };
  }, [active, containerRef]);
}

/** Blur protected content when tab/window loses focus (helps deter screenshots). */
export function useVisibilityProtection(active: boolean) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setIsBlocked(false);
      setBlockReason(null);
      return;
    }

    const block = (reason: string) => {
      setIsBlocked(true);
      setBlockReason(reason);
    };

    const unblock = () => {
      setIsBlocked(false);
      setBlockReason(null);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        block("Return to this tab to continue viewing protected content.");
      } else {
        unblock();
      }
    };

    const onWindowBlur = () => {
      block("Return to ENAMEL ROADS to continue viewing protected content.");
    };

    const onWindowFocus = () => {
      if (!document.hidden) unblock();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "PrintScreen") {
        event.preventDefault();
        block("Screenshots are disabled for protected PDF notes.");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("keyup", onKeyUp, true);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
      document.removeEventListener("keyup", onKeyUp, true);
    };
  }, [active]);

  return { isBlocked, blockReason };
}
