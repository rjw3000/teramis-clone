"use client";
import { useEffect, useId, useRef, useState } from "react";
import { FORMS, type FormKind } from "../lib/forms";
type HubspotWindow = Window & {
  hbspt?: { forms: { create: (options: Record<string, unknown>) => void } };
};
export function LeadForm({ kind = "demo" }: { kind?: FormKind }) {
  const config = FORMS[kind];
  const id = "teramis-form-" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<
    "waiting" | "loading" | "ready" | "error"
  >("waiting");
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let script: HTMLScriptElement | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const observer = new MutationObserver(() => {
      if (container.querySelector("form, iframe")) {
        setStatus("ready");
        clearTimeout(timeout);
      }
    });
    const load = () => {
      if (script || disposed) return;
      setStatus("loading");
      observer.observe(container, { childList: true, subtree: true });
      script = document.createElement("script");
      script.src = config.legacy
        ? "https://js-na2.hsforms.net/forms/embed/v2.js"
        : "https://js-na2.hsforms.net/forms/embed/246523533.js";
      script.async = true;
      script.onerror = () => {
        if (!disposed) {
          clearTimeout(timeout);
          setStatus("error");
        }
      };
      if (config.legacy)
        script.onload = () => {
          if (disposed) return;
          (window as HubspotWindow).hbspt?.forms.create({
            portalId: "246523533",
            formId: config.id,
            region: "na2",
            target: "#" + id,
          });
        };
      timeout = setTimeout(() => {
        if (!disposed && !container.querySelector("form,iframe"))
          setStatus("error");
      }, 20000);
      document.body.appendChild(script);
    };
    const visibility = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          visibility.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    visibility.observe(container);
    return () => {
      disposed = true;
      visibility.disconnect();
      observer.disconnect();
      clearTimeout(timeout);
      script?.remove();
      container.replaceChildren();
    };
  }, [config, id]);
  return (
    <section className="lead-form card" aria-label={config.title}>
      <h2>{config.title}</h2>
      <p>
        Tell us about your organization and the decision you need to make.
        Teramis will follow up to confirm fit and next steps.
      </p>
      <p className="form-safety">
        General business inquiries only. Please do not submit CUI,
        export-controlled information, credentials, or sensitive files.
      </p>
      <div aria-live="polite">
        {status === "waiting" || status === "loading" ? (
          <p>Loading the Teramis form…</p>
        ) : status === "error" ? (
          <p role="alert">
            The embedded form could not load. You can complete your request on
            the Teramis website.
          </p>
        ) : null}
      </div>
      <div
        ref={host}
        id={id}
        className={config.legacy ? "form-host" : "form-host hs-form-frame"}
        data-region="na2"
        data-form-id={config.id}
        data-portal-id="246523533"
      />
      <p className="small">
        <a href={config.source}>Open this form on teramis.us</a> ·{" "}
        <a href="/privacy-policy">Privacy policy</a>
      </p>
      <noscript>
        <p>
          JavaScript is needed for the embedded form.{" "}
          <a href={config.source}>Complete your request on Teramis.</a>
        </p>
      </noscript>
    </section>
  );
}
