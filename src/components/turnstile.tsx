"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

type TurnstileApi = {
  render: (el: HTMLElement, options: { sitekey: string }) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Cloudflare Turnstile widget. On success it injects a hidden input named
 * `cf-turnstile-response` into its container, so a parent <form> picks the token
 * up automatically via FormData. Renders nothing when no site key is configured,
 * which keeps forms working in local/demo mode.
 */
export function Turnstile({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) {
      return;
    }

    let cancelled = false;

    function render() {
      if (cancelled || widgetId.current || !containerRef.current || !window.turnstile) {
        return;
      }
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY as string,
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", render);
      } else {
        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", render);
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          // Widget already gone; nothing to clean up.
        }
        widgetId.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}
