"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_KEY, setCookieConsent } from "../lib/consent";

const OPEN_EVENT = "teramis:cookies";

export function CookieNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let ck: string | null = null;
    try {
      ck = localStorage.getItem(CONSENT_KEY);
    } catch {}
    const t = ck ? undefined : setTimeout(() => setOpen(true), 600);
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      clearTimeout(t);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  const choose = (v: "all" | "essential") => () => {
    setCookieConsent(v);
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="cookie"
    >
      <p>
        We use essential storage to remember your privacy preferences. With your
        consent, we may also use analytics to improve the site. See our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
      <div className="row-gap">
        <button className="pill pill-accent" onClick={choose("all")}>
          Accept all
        </button>
        <button className="pill pill-line" onClick={choose("essential")}>
          Essential only
        </button>
      </div>
    </div>
  );
}

export function CookieButton() {
  return (
    <button
      className="link-btn"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      Cookie preferences
    </button>
  );
}
