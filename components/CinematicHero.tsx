"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Layers } from "./icons";

const modes = [
  {
    title: "Discover",
    code: "01",
    file: "Engineering_Notes_Unmarked.pdf",
    status: "Potential CUI identified",
    detail: "Content evidence · unmarked document",
    label: "FINDING",
    value: "Review required",
  },
  {
    title: "Validate",
    code: "02",
    file: "Endpoints / Field laptops / FLD-LT-007",
    status: "Boundary exception",
    detail: "Compare with the documented scope",
    label: "LOCATION",
    value: "Outside boundary",
  },
  {
    title: "Remediate",
    code: "03",
    file: "Approved enclave / Engineering",
    status: "Awaiting authorized approval",
    detail: "Verify the transfer · preserve the record",
    label: "ACTION",
    value: "Approval required",
  },
];

export function CinematicHero({
  onExplore,
}: {
  onExplore: (e: React.MouseEvent) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const section = useRef<HTMLElement>(null);
  const userPaused = useRef(false);
  const canAnimate = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState(0);
  const current = modes[mode];

  useEffect(() => {
    const el = video.current;
    const root = section.current;
    if (!el || !root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    let visible = true;
    const sync = () => {
      canAnimate.current = !preference.matches && !connection?.saveData;
      if (
        visible &&
        !document.hidden &&
        canAnimate.current &&
        !userPaused.current
      ) {
        if (!el.getAttribute("src")) el.src = "/media/defense-scan.mp4";
        void el.play().catch(() => setPlaying(false));
      } else el.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.08 },
    );
    observer.observe(root);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      el.pause();
    };
  }, []);

  const toggleVideo = async () => {
    const el = video.current;
    if (!el) return;
    if (playing) {
      userPaused.current = true;
      el.pause();
    } else {
      userPaused.current = false;
      if (!el.getAttribute("src")) el.src = "/media/defense-scan.mp4";
      try {
        await el.play();
      } catch {
        setPlaying(false);
      }
    }
  };

  return (
    <section
      ref={section}
      className={"cinematic-hero" + (playing ? " is-playing" : "")}
      aria-labelledby="hero-title"
    >
      <div className="cinematic-media" aria-hidden="true">
        <img
          src="/media/defense-poster.jpg"
          className="cinematic-poster"
          alt=""
          fetchPriority="high"
          width={1920}
          height={1080}
        />
        <video
          ref={video}
          className={ready ? "cinematic-video ready" : "cinematic-video"}
          muted
          loop
          playsInline
          preload="none"
          poster="/media/defense-poster.jpg"
          onPlaying={() => {
            setPlaying(true);
            setReady(true);
          }}
          onPause={() => setPlaying(false)}
          onError={() => {
            setPlaying(false);
            setReady(false);
          }}
        />
      </div>
      <div className="cinematic-shade" aria-hidden="true" />
      <div className="cinematic-grid" aria-hidden="true" />
      <div className="wrap cinematic-content">
        <div className="mission-eyebrow">
          <span className="signal-dot" /> CUI DISCOVERY <span>/</span> DEFENSE
          INDUSTRIAL BASE
        </div>
        <h1 id="hero-title">
          Mission-critical data.
          <br />
          <span>Total visibility.</span>
        </h1>
        <p className="cinematic-lead">
          Your mission depends on what you know.
          <br />
          Find CUI wherever it lives. Validate the boundary.
          <br className="desktop-break" /> Turn discovery into defensible
          action.
        </p>
        <div className="hero-actions">
          <Link href="/request-a-demo" className="mission-primary">
            Request a demo <ArrowRight size={18} />
          </Link>
          <a href="#explore" onClick={onExplore} className="mission-secondary">
            <Layers size={18} /> Enter the explorer
          </a>
        </div>
        <div className="mission-assurance">
          <span>Customer-controlled environment</span>
          <span>Authorized actions</span>
          <span>Evidence at every level</span>
        </div>
      </div>
      <div className="hero-console" aria-label="Interactive discovery example">
        <div className="console-top">
          <span>
            <i /> DISCOVERY CONSOLE
          </span>
          <span>SYNTHETIC DEMO</span>
        </div>
        <div
          className="console-tabs"
          role="group"
          aria-label="Preview discovery stages"
        >
          {modes.map((m, i) => (
            <button
              type="button"
              key={m.code}
              aria-pressed={mode === i}
              onClick={() => setMode(i)}
            >
              <span>{m.code}</span> {m.title}
            </button>
          ))}
        </div>
        <div className="console-display" aria-live="polite">
          <div className="console-reticle" aria-hidden="true">
            <span />
            <i />
            <b />
          </div>
          <div className="console-findings">
            <span className="console-status">{current.status}</span>
            <strong>{current.file}</strong>
            <small>{current.detail}</small>
          </div>
        </div>
        <div className="console-bottom">
          <span>{current.label}</span>
          <strong>{current.value}</strong>
          <span className="console-line" />
        </div>
      </div>
      <div className="hero-base wrap">
        <div className="hero-coordinate">
          <span>01 / MISSION INTELLIGENCE</span>
          <small>AI-generated cinematic visualization</small>
        </div>
        <button
          type="button"
          className="video-toggle"
          onClick={toggleVideo}
          aria-label={playing ? "Pause hero video" : "Play hero video"}
          aria-pressed={playing}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
          {playing ? "Pause motion" : "Play motion"}
        </button>
        <a href="#workflow" className="hero-scroll">
          <span>Explore the platform</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
