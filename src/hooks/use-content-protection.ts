"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

const BLOCKED_KEYS = new Set(["c", "s", "p", "a", "u"]);
const FOCUS_POLL_MS = 200;

function shouldBlockShortcut(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  const withMod = event.ctrlKey || event.metaKey;
  if (!withMod) return false;
  if (event.shiftKey && (key === "i" || key === "j" || key === "c")) return true;
  return BLOCKED_KEYS.has(key);
}

function isCaptureRiskState() {
  return document.hidden || !document.hasFocus();
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
      if (event.key === "PrintScreen") {
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

/**
 * Hide protected pixels when the tab/app loses focus.
 * CSS blur alone does not stop OS screenshots — content must be removed from the DOM.
 */
export function useVisibilityProtection(active: boolean) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const blockedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      blockedRef.current = false;
      setIsBlocked(false);
      setBlockReason(null);
      return;
    }

    const block = (reason: string) => {
      blockedRef.current = true;
      setIsBlocked(true);
      setBlockReason(reason);
    };

    const unblock = () => {
      blockedRef.current = false;
      setIsBlocked(false);
      setBlockReason(null);
    };

    const syncCaptureRisk = () => {
      if (isCaptureRiskState()) {
        if (!blockedRef.current) {
          block("Return to ENAMEL ROADS to continue viewing protected content.");
        }
      } else if (blockedRef.current) {
        unblock();
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        block("Return to this tab to continue viewing protected content.");
      } else if (document.hasFocus()) {
        unblock();
      }
    };

    const onWindowBlur = () => {
      block("Return to ENAMEL ROADS to continue viewing protected content.");
    };

    const onWindowFocus = () => {
      if (!document.hidden) unblock();
    };

    const onPageHide = () => {
      block("Protected content hidden while you are away.");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "PrintScreen") {
        event.preventDefault();
        block("Screenshots are disabled for protected PDF notes.");
        window.setTimeout(() => {
          if (!isCaptureRiskState()) unblock();
        }, 2500);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("keydown", onKeyDown, true);

    const poll = window.setInterval(syncCaptureRisk, FOCUS_POLL_MS);
    syncCaptureRisk();

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("keydown", onKeyDown, true);
      window.clearInterval(poll);
    };
  }, [active]);

  return { isBlocked, blockReason };
}
