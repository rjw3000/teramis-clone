"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import {
  CONSENT_CHANGED,
  filterAnalyticsEvent,
  hasAnalyticsConsent,
} from "../lib/consent";

export function ConsentAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(hasAnalyticsConsent());
    window.addEventListener(CONSENT_CHANGED, sync);
    window.addEventListener("storage", sync);
    sync();
    return () => {
      window.removeEventListener(CONSENT_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return allowed ? <Analytics beforeSend={filterAnalyticsEvent} /> : null;
}
