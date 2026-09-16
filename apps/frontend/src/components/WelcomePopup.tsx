"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const WELCOME_INTRO =
  "This demo app shows a real-time dashboard heavily updated via WebSocket, built with React, Zustand and Next.js. You can see that the dashboard shows no performance issues even though it processes thousands of updates per second.";

const WELCOME_INSTRUCTIONS =
  'Click "Start" button under the city map to start generating pedestrians traffic. Then increase the traffic with the slider.';

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog overlay"
        className="absolute inset-0 bg-stone-950/40"
        onClick={close}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative z-10 flex max-h-[min(90dvh,100%)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-stone-300 bg-white shadow-lg outline-none"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-200 px-4 py-3 sm:px-5">
          <h2 id={titleId} className="pr-2 text-base font-semibold text-slate-900 sm:text-lg">
            Welcome
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-lg leading-none text-stone-700 hover:bg-stone-100"
          >
            ×
          </button>
        </div>

        <div
          id={descriptionId}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-slate-700 sm:px-5 sm:text-base"
        >
          <p>{WELCOME_INTRO}</p>
          <p>{WELCOME_INSTRUCTIONS}</p>
        </div>

        <div className="flex shrink-0 justify-end border-t border-stone-200 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={close}
            className="min-w-22 rounded-md border border-violet-300/90 bg-violet-100/85 px-3 py-2 text-sm font-medium text-violet-900 shadow-sm hover:bg-violet-100"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}
