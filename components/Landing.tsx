"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LEVELS,
  PLURAL,
  SAMPLE,
  canon,
  fmt,
  parseHash,
  resolve,
} from "../lib/explorer";
import * as I from "./icons";
import {
  ProofStrip,
  LifecycleOverview,
  RemediationPreview,
  RemediationSection,
  DeploymentSection,
  AudienceSection,
  EvidenceSection,
  CustomerStories,
  EngagementOptions,
  FaqSection,
  ContactSection,
  MonitoringComparison,
} from "./MarketingSections";

const lc = (i: number) => `var(--l${i})`;
const lt = (i: number) => `var(--t${i})`;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

type Phase = "idle" | "out" | "enter";

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function Eyebrow({ items }: { items: string[] }) {
  return (
    <div className="eyebrow">
      {items.map((t, i) => (
        <span key={t} style={{ display: "contents" }}>
          {i > 0 ? <span className="sep">/</span> : null}
          <span className={i === items.length - 1 ? "accent" : undefined}>
            {t}
          </span>
        </span>
      ))}
    </div>
  );
}

function useReveal() {
  useEffect(() => {
    if (reducedMotion() || !("IntersectionObserver" in window)) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          io.unobserve(el);
          timers.push(
            setTimeout(() => {
              el.style.transform = "";
              el.style.transition = "";
              el.style.transitionDelay = "";
            }, 900),
          );
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      const d = +(el.getAttribute("data-reveal") || 0);
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 480ms ease-out, transform 480ms ease-out";
      el.style.transitionDelay = d * 100 + "ms";
      io.observe(el);
    });
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);
}

export function Landing() {
  const explorerRef = useRef<HTMLDivElement>(null);
  const t1 = useRef<ReturnType<typeof setTimeout>>();
  const t2 = useRef<ReturnType<typeof setTimeout>>();
  const [path, setPath] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dir, setDir] = useState(1);
  const [bars, setBars] = useState(true);
  const [last, setLast] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [guided, setGuided] = useState(false);
  const [outsideOnly, setOutsideOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [fileType, setFileType] = useState("all");
  const [review, setReview] = useState("all");
  const [explorerVisible, setExplorerVisible] = useState(false);
  const [openFeat, setOpenFeat] = useState<number | null>(null);
  const pathRef = useRef(path);
  pathRef.current = path;

  useReveal();
  useEffect(() => {
    const el = explorerRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) =>
      setExplorerVisible(entries.some((e) => e.isIntersecting)),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    setQuery("");
    setFileType("all");
    setReview("all");
    setOutsideOnly(false);
  }, [resolve(path).ids.join("/")]);

  const scrollToExplorer = useCallback((force: boolean) => {
    const el = explorerRef.current;
    if (!el) return;
    const off = 112 + 16;
    const top = el.getBoundingClientRect().top;
    if (force || top < off - 4)
      window.scrollTo({
        top: top + window.scrollY - off,
        behavior: reducedMotion() ? "auto" : "smooth",
      });
  }, []);

  const nav = useCallback(
    (newPath: string[], opts: { push?: boolean; scroll?: boolean } = {}) => {
      const curPath = pathRef.current;
      const cur = resolve(curPath);
      const next = canon(newPath);
      const nx = resolve(next);
      const key = next.join("/");
      if (key === curPath.join("/")) {
        if (opts.scroll) scrollToExplorer(true);
        return;
      }
      if (opts.push !== false) {
        try {
          window.history.pushState(
            null,
            "",
            "#explore" + (key ? "=" + key : ""),
          );
        } catch {}
      }
      // Opening or closing a file at the same location: no panel transition.
      if (cur.ids.join("/") === nx.ids.join("/")) {
        setPath(next);
        if (opts.scroll) scrollToExplorer(true);
        return;
      }
      // Going up: remember which child we came from so it can be marked visited.
      if (
        cur.ids.length > nx.ids.length &&
        cur.ids.slice(0, nx.ids.length).join("/") === nx.ids.join("/")
      ) {
        setLast((l) => ({ ...l, [nx.ids.join("/")]: cur.ids[nx.ids.length] }));
      }
      if (reducedMotion()) {
        setPath(next);
        setPhase("idle");
        setBars(true);
        scrollToExplorer(!!opts.scroll);
        return;
      }
      setDir(nx.ids.length > cur.ids.length ? 1 : -1);
      setPhase("out");
      clearTimeout(t1.current);
      t1.current = setTimeout(() => {
        setPath(next);
        setPhase("enter");
        setBars(false);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setPhase("idle");
            setBars(true);
          }),
        );
        scrollToExplorer(!!opts.scroll);
      }, 150);
    },
    [scrollToExplorer],
  );

  const up = useCallback(() => {
    const r = resolve(pathRef.current);
    if (r.file != null) nav(r.ids);
    else if (r.ids.length) nav(r.ids.slice(0, -1));
  }, [nav]);

  useEffect(() => {
    const p = parseHash(window.location.hash);
    if (p) {
      setPath(canon(p));
      setTimeout(() => scrollToExplorer(true), 300);
    }
    const onPop = () => {
      const q = parseHash(window.location.hash);
      if (q) nav(q, { push: false });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pathRef.current.length) up();
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      clearTimeout(t1.current);
      clearTimeout(t2.current);
    };
  }, [nav, up, scrollToExplorer]);

  const r = resolve(path);
  const node = r.node;
  const depth = r.ids.length + (r.file != null ? 1 : 0);
  const nodeDepth = r.ids.length;
  const curKey = r.ids.join("/");
  const keyStr = path.join("/");
  const deepLink = "#explore" + (keyStr ? "=" + keyStr : "");
  const atRoot = depth === 0;
  const parentLabel =
    depth === 0
      ? null
      : r.file != null
        ? node.label
        : r.chain[nodeDepth - 1].label;
  const backLabel = parentLabel
    ? `Back to ${parentLabel}`
    : "Top level of the environment";
  const title = r.file != null ? r.files![r.file].name : node.label;
  const levelTag = `L${depth} · ${LEVELS[depth]}`;
  const levelStyle = { background: lt(depth), color: lc(depth) };

  const crumbs = r.chain.map((n, i) => ({
    label: n.label,
    current: i === depth,
    color: lc(i),
    go: () => nav(r.ids.slice(0, i)),
  }));
  if (r.file != null)
    crumbs.push({
      label: r.files![r.file].name,
      current: true,
      color: lc(4),
      go: () => {},
    });

  const maxF = node.children
    ? Math.max(...node.children.map((c) => c.findings))
    : 1;
  const visitedId = last[curKey];
  const crumbPath = r.chain
    .slice(1)
    .map((n) => n.label)
    .join(" / ");
  const pct = node.findings ? node.outside / node.findings : 0;
  const dx = dir > 0 ? 24 : -24;
  const panelStyle: React.CSSProperties = {
    opacity: phase === "idle" ? 1 : 0,
    transform:
      phase === "out"
        ? `translateX(${-dx}px)`
        : phase === "enter"
          ? `translateX(${dx}px)`
          : "translateX(0)",
    transition:
      phase === "out"
        ? "opacity 150ms ease, transform 150ms ease"
        : phase === "enter"
          ? "none"
          : `opacity 300ms ${EASE}, transform 300ms ${EASE}`,
  };
  const liveMsg =
    r.file != null
      ? `Showing file: ${title}. Location totals: ${fmt(node.findings)} potential findings, ${fmt(node.outside)} outside the documented boundary.`
      : `Showing L${depth} · ${LEVELS[depth]}: ${title}. ${fmt(node.findings)} potential findings, ${fmt(node.outside)} outside the documented boundary.`;

  const copyLink = () => {
    const url = window.location.href.split("#")[0] + deepLink;
    const done = () => {
      setCopied(true);
      clearTimeout(t2.current);
      t2.current = setTimeout(() => setCopied(false), 1800);
    };
    try {
      setCopyError(false);
      navigator.clipboard.writeText(url).then(done, () => setCopyError(true));
    } catch {
      setCopyError(true);
    }
  };

  const goExplorer = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToExplorer(true);
  };
  const plane = (i: number) => () => nav(SAMPLE[i], { scroll: true });
  const feat = (i: number) => () => setOpenFeat((f) => (f === i ? null : i));

  const planes = [
    { name: "ENVIRONMENT", title: "L0 · Environment" },
    { name: "SOURCE", title: "L1 · Source" },
    { name: "REPOSITORY", title: "L2 · Repository" },
    { name: "LOCATION", title: "L3 · Location" },
  ];

  return (
    <>
      <div
        role="navigation"
        aria-label="Exploration context"
        className="ctx"
        hidden={!explorerVisible}
      >
        <div className="wrap ctx-in">
          <button
            className="ctx-back"
            onClick={up}
            disabled={atRoot}
            aria-label={backLabel}
            title={backLabel}
          >
            <I.ArrowLeft size={16} />
          </button>
          <span className="mono-label ctx-tag">CONTEXT</span>
          <ol className="ctx-crumbs">
            {crumbs.map((c, i) => (
              <li key={i}>
                {i > 0 ? (
                  <span aria-hidden="true" className="ctx-sep">
                    /
                  </span>
                ) : null}
                <button
                  onClick={c.go}
                  aria-current={c.current ? "page" : undefined}
                  className={"crumb" + (c.current ? " on" : "")}
                  style={c.current ? { background: lt(i) } : undefined}
                >
                  <span className="dot" style={{ background: c.color }} />
                  {c.label}
                </button>
              </li>
            ))}
          </ol>
          <a
            href="#explore"
            onClick={goExplorer}
            className="ctx-level"
            style={levelStyle}
          >
            {levelTag}
          </a>
        </div>
      </div>

      <main id="main" tabIndex={-1} className="landing">
        <section className="hero">
          <div className="wrap hero-in">
            <div data-reveal="0" className="hero-copy">
              <Eyebrow items={["Teramis", "Platform", "CUI Discovery"]} />
              <h1>
                Know where your CUI <span className="accent">actually</span>{" "}
                lives.
              </h1>
              <p className="lead">
                Teramis helps Defense Industrial Base organizations, government
                agencies, and compliance partners discover CUI, ITAR, and other
                covered defense information wherever it lives — from the whole
                environment down to the file — so you can validate the boundary,
                remediate what’s out of place, and monitor for spillage over
                time.
              </p>
              <div className="row-gap">
                <Link
                  href="/request-a-demo"
                  className="pill pill-accent pill-lg"
                >
                  Request a Demo
                  <I.ArrowRight />
                </Link>
                <a
                  href="#explore"
                  onClick={goExplorer}
                  className="pill pill-line pill-lg"
                >
                  <I.Layers />
                  Explore the environment
                </a>
              </div>
              <ul className="ticks">
                <li>
                  <I.Check size={16} stroke="var(--l2)" />
                  Scanning inside your environment
                </li>
                <li>
                  <I.Check size={16} stroke="var(--l2)" />
                  Remediation only on approved actions
                </li>
              </ul>
            </div>

            <div data-reveal="2" className="hero-art">
              <div className="stack-stage">
                <div className="stack">
                  {planes.map((p, i) => (
                    <button
                      type="button"
                      aria-label={"Explore " + p.title}
                      key={p.name}
                      onClick={plane(i)}
                      title={p.title}
                      className={"plane plane-" + i}
                    >
                      <span>
                        L{i} · {p.name}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label="Explore L4 · File"
                    onClick={plane(4)}
                    title="L4 · File"
                    className="plane plane-4"
                  >
                    <I.FileText size={30} width={1.75} />
                  </button>
                </div>
              </div>
              <div className="glass hero-scan">
                <span className="muted">DEMO SCAN · 1,018,500 FILES</span>
                <span className="hero-scan-n">
                  <span className="pulse" />
                  3,516 potential findings
                </span>
              </div>
              <div className="glass hero-path">
                <span className="mono-label">DEMO DRILL-DOWN PATH</span>
                <span className="hero-path-p">
                  <span style={{ color: lc(0) }}>Environment</span>
                  <span className="sep">/</span>
                  <span style={{ color: lc(1) }}>Microsoft 365</span>
                  <span className="sep">/</span>
                  <span style={{ color: lc(2) }}>SharePoint</span>
                  <span className="sep">/</span>
                  <span style={{ color: lc(3) }}>Engineering Site</span>
                </span>
                <span className="small muted">
                  812 findings ·{" "}
                  <span className="danger strong">41 outside boundary</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <ProofStrip />
        <LifecycleOverview />
        <section id="explore" data-section="explore" className="band">
          <div className="wrap stack-40">
            <div data-reveal="0" className="sec-head">
              <div className="sec-title">
                <Eyebrow items={["Teramis", "Explorer"]} />
                <h2>From environment to file, without losing context.</h2>
                <p className="muted">
                  Click any row to drill down a level. Go back up with the
                  breadcrumb, the back button, or Esc — every level has its own
                  link, and the browser back button works.
                </p>
              </div>
              <span className="tag-dashed">SYNTHETIC DEMO DATA</span>
            </div>

            <div className="guided card">
              <div className="spread">
                <div>
                  <strong>Try a guided scenario</strong>
                  <p className="small muted">
                    Find an unmarked engineering document outside the approved
                    boundary, review the evidence, then preview an approved
                    action.
                  </p>
                </div>
                <button
                  className="pill pill-accent"
                  onClick={() => {
                    setGuided(true);
                    nav(["endpoints"], { scroll: true });
                  }}
                >
                  Start guided walkthrough →
                </button>
              </div>
              {guided ? (
                <div className="guided-progress" aria-live="polite">
                  <strong>
                    {r.file != null
                      ? "Review the unmarked finding. Mark it reviewed, then open the remediation preview."
                      : r.ids.join("/") === "endpoints/field/lt007"
                        ? "Open Engineering_Notes_Unmarked.pdf."
                        : r.ids.join("/") === "endpoints/field"
                          ? "Open FLD-LT-007."
                          : "Open Field laptops."}
                  </strong>
                  <button
                    className="text-link"
                    onClick={() => {
                      setGuided(false);
                      nav([], { scroll: true });
                    }}
                  >
                    Exit walkthrough
                  </button>
                </div>
              ) : null}
            </div>
            <div
              ref={explorerRef}
              data-reveal="1"
              role="region"
              aria-label="CUI drill-down explorer"
              className="card xp"
            >
              <div className="xp-head">
                <button
                  className="xp-back"
                  onClick={up}
                  disabled={atRoot}
                  aria-label={backLabel}
                >
                  <I.ArrowLeft size={20} />
                </button>
                <div className="xp-title">
                  <span className="small muted">{backLabel}</span>
                  <div className="xp-title-row">
                    <h3>{title}</h3>
                    <span className="level-chip" style={levelStyle}>
                      {levelTag}
                    </span>
                  </div>
                </div>
                <button className="pill pill-line pill-sm" onClick={copyLink}>
                  <I.Link2 size={16} />
                  {copyError
                    ? "Copy unavailable"
                    : copied
                      ? "Link copied"
                      : "Copy link"}
                </button>
              </div>

              <p aria-live="polite" aria-atomic="true" className="sr-only">
                {liveMsg}
              </p>
              <ol aria-label="Levels" className="xp-steps">
                {LEVELS.map((name, i) => (
                  <li key={name}>
                    <button
                      onClick={() => {
                        if (i < depth)
                          nav(i <= nodeDepth ? r.ids.slice(0, i) : path);
                      }}
                      aria-current={i === depth ? "step" : undefined}
                      className={
                        "xp-step" +
                        (i === depth ? " on" : "") +
                        (i < depth ? " past" : "")
                      }
                      style={{ opacity: i <= depth ? 1 : 0.45 }}
                    >
                      <span
                        className="xp-step-bar"
                        style={{
                          background: i <= depth ? lc(i) : "var(--line)",
                        }}
                      />
                      <span
                        className="xp-step-n"
                        style={{ color: i <= depth ? lc(i) : "var(--muted)" }}
                      >
                        L{i}
                      </span>
                      <span className="xp-step-name">{name}</span>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="xp-filters">
                <label>
                  Search this level
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name or location"
                  />
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={outsideOnly}
                    onChange={(e) => setOutsideOnly(e.target.checked)}
                  />
                  {node.children
                    ? "Locations with exceptions"
                    : "Outside boundary only"}
                </label>
                {r.files ? (
                  <>
                    <label>
                      File type
                      <select
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                      >
                        <option value="all">All file types</option>
                        {Array.from(new Set(r.files.map((f) => f.type))).map(
                          (type) => (
                            <option key={type}>{type}</option>
                          ),
                        )}
                      </select>
                    </label>
                    <label>
                      Review
                      <select
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                      >
                        <option value="all">All findings</option>
                        <option value="pending">Needs review</option>
                        <option value="reviewed">Reviewed in demo</option>
                      </select>
                    </label>
                  </>
                ) : null}
                <span className="small muted">
                  Totals describe this level; filters affect the rows shown.
                </span>
              </div>
              <div className="xp-body" style={panelStyle}>
                <aside className="xp-kpis">
                  <div className="kpi">
                    <span className="mono-label">
                      {r.file != null
                        ? "LOCATION FILES ANALYZED"
                        : "FILES ANALYZED"}
                    </span>
                    <span className="kpi-n">{fmt(node.files)}</span>
                  </div>
                  <div className="kpi">
                    <span className="mono-label">
                      {r.file != null
                        ? "LOCATION POTENTIAL FINDINGS"
                        : "POTENTIAL CUI FINDINGS"}
                    </span>
                    <span className="kpi-n" style={{ color: lc(depth) }}>
                      {fmt(node.findings)}
                    </span>
                  </div>
                  <div className="kpi kpi-8">
                    <span className="mono-label">
                      {r.file != null
                        ? "LOCATION OUTSIDE BOUNDARY"
                        : "OUTSIDE DOCUMENTED BOUNDARY"}
                    </span>
                    <span className="kpi-n danger">{fmt(node.outside)}</span>
                    <div className="meter">
                      <div
                        style={{
                          transform: `scaleX(${bars ? Math.min(1, pct * 4).toFixed(3) : 0})`,
                        }}
                      />
                    </div>
                    <span className="small muted">
                      {(pct * 100).toLocaleString("en-US", {
                        maximumFractionDigits: 1,
                      })}
                      % of findings at this level
                    </span>
                  </div>
                </aside>

                <div className="xp-list">
                  {node.children ? (
                    <>
                      <div className="xp-cols mono-label">
                        <span style={{ flex: 1 }}>
                          L{nodeDepth + 1} ·{" "}
                          {LEVELS[nodeDepth + 1].toUpperCase()}
                        </span>
                        <span className="c-files">FILES</span>
                        <span className="c-find">FINDINGS</span>
                        <span className="c-out">OUTSIDE</span>
                        <span style={{ width: 20 }} />
                      </div>
                      <div className="stack-4">
                        {node.children
                          .filter(
                            (c) =>
                              (!outsideOnly || c.outside > 0) &&
                              c.label
                                .toLowerCase()
                                .includes(query.toLowerCase()),
                          )
                          .map((c, i) => {
                            const visited = c.id === visitedId;
                            const share = Math.round(
                              (c.findings / node.findings) * 100,
                            );
                            const color = lc(nodeDepth + 1);
                            const tint = lt(nodeDepth + 1);
                            return (
                              <button
                                key={c.id}
                                onClick={() => nav([...r.ids, c.id])}
                                className="xp-row"
                                style={
                                  visited ? { background: tint } : undefined
                                }
                              >
                                <span className="xp-row-main">
                                  <span className="xp-row-label">
                                    <span
                                      className="ico-28"
                                      style={{ background: tint, color }}
                                    >
                                      <I.Folder size={15} />
                                    </span>
                                    <span className="xp-row-name">
                                      {c.label}
                                    </span>
                                    {visited ? (
                                      <span
                                        className="visited"
                                        style={{ background: color }}
                                      >
                                        VISITED
                                      </span>
                                    ) : null}
                                  </span>
                                  <span className="xp-row-bar">
                                    <span
                                      style={{
                                        background: color,
                                        transform: `scaleX(${bars ? (c.findings / maxF).toFixed(3) : 0})`,
                                        transitionDelay: i * 60 + "ms",
                                      }}
                                    />
                                  </span>
                                  <span className="xp-row-sub">
                                    {c.children
                                      ? `${c.children.length} ${PLURAL[nodeDepth + 2]} · ${share}% of findings`
                                      : `${share}% of findings · open files`}
                                  </span>
                                </span>
                                <span className="xp-row-stats">
                                  <span className="c-files muted">
                                    {fmt(c.files)}
                                  </span>
                                  <span className="c-find strong">
                                    {fmt(c.findings)}
                                  </span>
                                  <span className="c-out">
                                    <span className="badge-danger">
                                      {fmt(c.outside)}
                                    </span>
                                  </span>
                                  <I.ChevronRight stroke="var(--muted)" />
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </>
                  ) : (
                    <div className="stack-6">
                      {r.files!.map((f, i) => {
                        const reviewed = !!validated[curKey + "/f" + i];
                        if (
                          (outsideOnly && !f.out) ||
                          !f.name.toLowerCase().includes(query.toLowerCase()) ||
                          (fileType !== "all" && f.type !== fileType) ||
                          (review === "pending" && reviewed) ||
                          (review === "reviewed" && !reviewed)
                        )
                          return null;
                        const k = curKey + "/f" + i;
                        const open = r.file === i;
                        const val = !!validated[k];
                        const status = val
                          ? "Reviewed in demo"
                          : f.out
                            ? "Outside boundary"
                            : "Inside boundary";
                        const statusStyle = val
                          ? {
                              background: "var(--accent-t)",
                              color: "var(--accent)",
                            }
                          : f.out
                            ? {
                                background: "var(--danger-t)",
                                color: "var(--danger)",
                              }
                            : { background: lt(2), color: lc(2) };
                        return (
                          <div
                            key={i}
                            className={"xp-file" + (open ? " open" : "")}
                          >
                            <button
                              onClick={() =>
                                nav(open ? r.ids : [...r.ids, "f" + i])
                              }
                              aria-expanded={open}
                              className="xp-file-btn"
                            >
                              <span className="ico-32">
                                <I.FileText size={16} />
                              </span>
                              <span className="xp-file-name">
                                <span className="mono strong">{f.name}</span>
                                <span className="small muted">
                                  {f.type} · modified {f.modified}
                                </span>
                              </span>
                              <span className="xp-file-tags">
                                <span className="marker">{f.marker}</span>
                                <span className="status" style={statusStyle}>
                                  {status}
                                </span>
                                <I.ChevronDown
                                  stroke="var(--muted)"
                                  style={{
                                    transform: open ? "rotate(180deg)" : "none",
                                    transition:
                                      "transform var(--drill-transition)",
                                  }}
                                />
                              </span>
                            </button>
                            {open ? (
                              <div className="xp-file-detail">
                                <dl>
                                  <div>
                                    <dt>PATH</dt>
                                    <dd className="mono">
                                      {crumbPath + " / " + f.name}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt>REASON FOR REVIEW</dt>
                                    <dd>{f.evidence}</dd>
                                  </div>
                                  <div>
                                    <dt>SYNTHETIC EXCERPT</dt>
                                    <dd className="evidence-excerpt">
                                      {f.excerpt}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt>REVIEW RESPONSIBILITY</dt>
                                    <dd>
                                      Potential finding. Authorized personnel
                                      determine classification and handling.
                                    </dd>
                                  </div>
                                  <div>
                                    <dt>RECOMMENDED ACTION</dt>
                                    <dd>
                                      {f.out
                                        ? "Move to an authorized location with hash verification before removing the source (Remedius)."
                                        : "Confirm inside the boundary and record the evidence in the inventory."}
                                    </dd>
                                  </div>
                                </dl>
                                <div className="row-gap center">
                                  <button
                                    className="pill pill-ink pill-xs"
                                    onClick={() =>
                                      setValidated((s) => ({
                                        ...s,
                                        [k]: !s[k],
                                      }))
                                    }
                                  >
                                    <I.Check size={14} />
                                    {val
                                      ? "Undo demo review"
                                      : "Mark reviewed in demo"}
                                  </button>
                                  <span className="small muted">
                                    This button changes demonstration state
                                    only.
                                  </span>
                                </div>
                                {f.out && val ? (
                                  <details className="faq-item">
                                    <summary>
                                      Preview remediation for this finding
                                    </summary>
                                    <RemediationPreview fileName={f.name} />
                                  </details>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                      <p className="small muted">
                        Showing illustrative file records; this example is not a
                        complete scan inventory.
                      </p>
                      <span className="xp-more">
                        {node.findings > r.files!.length
                          ? `+ ${fmt(node.findings - r.files!.length)} more findings in this location`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="xp-empty" role="status">
                {node.children &&
                !node.children.some(
                  (c) =>
                    (!outsideOnly || c.outside > 0) &&
                    c.label.toLowerCase().includes(query.toLowerCase()),
                )
                  ? "No locations match these filters."
                  : r.files &&
                      !r.files.some(
                        (f, i) =>
                          (!outsideOnly || f.out) &&
                          f.name.toLowerCase().includes(query.toLowerCase()) &&
                          (fileType === "all" || f.type === fileType) &&
                          (review === "all" ||
                            (review === "reviewed") ===
                              !!validated[curKey + "/f" + i]),
                      )
                    ? "No findings match these filters."
                    : ""}
              </div>
              <div className="xp-foot">
                <span>
                  deep link: <span className="ink">{deepLink}</span>
                </span>
                <span className="row-gap-6">
                  <span className="kbd">Esc</span>goes up a level
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" data-section="features" className="sec">
          <div className="wrap stack-feat">
            <div data-reveal="0" className="sec-title">
              <Eyebrow items={["Teramis", "How it works"]} />
              <h2>Replace CUI assumptions with defensible evidence.</h2>
              <p className="muted">
                Teramis provides the CUI ground truth that compliance, security,
                advisory, and defensible decision-making depend on.
              </p>
            </div>

            <div data-reveal="0" className="feat">
              <div className="feat-copy">
                <div className="feat-tag" style={{ color: lc(1) }}>
                  <span className="ico-48" style={{ background: lt(1) }}>
                    <I.Search size={22} />
                  </span>
                  01 / FIND
                </div>
                <h3>CUI is rarely labeled — and rarely tidy.</h3>
                <p className="muted">
                  Discover CUI across the systems, repositories, and data
                  sources approved for review: technical documents, engineering
                  files, PDFs, email attachments, scans, archives, and folders
                  that have grown over years.
                </p>
                <FeatToggle
                  open={openFeat === 0}
                  onClick={feat(0)}
                  labels={["See supported sources", "Hide sources"]}
                />
                {openFeat === 0 ? (
                  <ul className="feat-list" style={{ borderColor: lt(1) }}>
                    <li>
                      <strong>Microsoft 365</strong>{" "}
                      <span className="muted">
                        — SharePoint, OneDrive, Exchange
                      </span>
                    </li>
                    <li>
                      <strong>File systems &amp; endpoints</strong>{" "}
                      <span className="muted">
                        — network file shares, local and distributed endpoints
                      </span>
                    </li>
                    <li>
                      <strong>Legacy repositories</strong>{" "}
                      <span className="muted">
                        — project and engineering folders
                      </span>
                    </li>
                    <li>
                      <strong>Complex file types</strong>{" "}
                      <span className="muted">
                        — CAD, PDFs, scanned images, email, archives
                      </span>
                    </li>
                  </ul>
                ) : null}
              </div>
              <div className="card feat-card">
                <div className="mono-label spread">
                  <span>DEMO · SOURCES EXAMINED</span>
                  <span>FINDINGS</span>
                </div>
                <div className="stack-14">
                  {(
                    [
                      ["Microsoft 365", "2,384", 100],
                      ["Network file shares", "821", 34],
                      ["Legacy repositories", "171", 7],
                      ["Endpoints", "140", 6],
                    ] as const
                  ).map(([label, n, w]) => (
                    <div key={label} className="stack-6">
                      <div className="spread strong small-14">
                        <span>{label}</span>
                        <span className="num">{n}</span>
                      </div>
                      <div className="track">
                        <div style={{ width: w + "%", background: lc(1) }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="text-link" onClick={plane(1)}>
                  Open in explorer
                  <I.ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div data-reveal="0" className="feat rev">
              <div className="feat-copy">
                <div className="feat-tag" style={{ color: lc(2) }}>
                  <span className="ico-48" style={{ background: lt(2) }}>
                    <I.Shield size={22} />
                  </span>
                  02 / PROVE
                </div>
                <h3>Does the documented boundary match reality?</h3>
                <p className="muted">
                  Validate findings and produce evidence so executives,
                  compliance teams, advisors, and security leaders can see where
                  the documented scope and the actual data diverge.
                </p>
                <FeatToggle
                  open={openFeat === 1}
                  onClick={feat(1)}
                  labels={["See how validation works", "Hide details"]}
                />
                {openFeat === 1 ? (
                  <ul className="feat-list" style={{ borderColor: lt(2) }}>
                    <li>
                      Compare findings with your documented CUI scope, asset
                      inventory, and system diagrams
                    </li>
                    <li>
                      Distinguish relevant findings from unrelated content
                    </li>
                    <li>Build a more defensible CUI inventory</li>
                    <li>
                      Clear reporting: your team or partner decides what happens
                      next
                    </li>
                  </ul>
                ) : null}
              </div>
              <div className="card feat-card stack-18">
                <span className="mono-label">DEMO · LOCATIONS WITH CUI</span>
                <div className="grid-2">
                  <div className="stat-box">
                    <span className="small muted">Documented</span>
                    <span className="stat-n">6</span>
                  </div>
                  <div className="stat-box" style={{ background: lt(2) }}>
                    <span className="small muted">Found</span>
                    <span className="stat-n" style={{ color: lc(2) }}>
                      11
                    </span>
                  </div>
                </div>
                <div className="stack-8">
                  <span className="small strong">
                    Exceptions outside the boundary
                  </span>
                  {(
                    [
                      ["Legacy repositories / NAS-2014 / Backups", 31],
                      ["Endpoints / Field laptops", 27],
                      ["Exchange / Shared mailboxes", 21],
                    ] as const
                  ).map(([p, n]) => (
                    <div key={p} className="exc">
                      <span className="mono">{p}</span>
                      <span className="badge-danger">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div data-reveal="0" className="feat">
              <div className="feat-copy">
                <div className="feat-tag" style={{ color: lc(3) }}>
                  <span className="ico-48" style={{ background: lt(3) }}>
                    <I.Activity size={22} />
                  </span>
                  03 / MONITOR
                </div>
                <h3>See what changed before the next assessment.</h3>
                <p className="muted">
                  Run recurring scans to identify new CUI, movement between
                  systems, spillage outside approved locations, and boundary
                  drift — before the next assessment, annual affirmation, or
                  prime contractor request.
                </p>
                <FeatToggle
                  open={openFeat === 2}
                  onClick={feat(2)}
                  labels={["See what is monitored", "Hide details"]}
                />
                {openFeat === 2 ? (
                  <ul className="feat-list" style={{ borderColor: lt(3) }}>
                    <li>New CUI</li>
                    <li>CUI outside approved locations</li>
                    <li>Changes between scans</li>
                    <li>Boundary drift</li>
                    <li>Recurring spillage risk</li>
                  </ul>
                ) : null}
              </div>
              <MonitoringComparison />
            </div>
          </div>
        </section>

        <RemediationSection />
        <DeploymentSection />
        <AudienceSection />
        <EvidenceSection />
        <CustomerStories />
        <EngagementOptions />
        <FaqSection />
        <ContactSection />
      </main>
    </>
  );
}

function FeatToggle({
  open,
  onClick,
  labels,
}: {
  open: boolean;
  onClick: () => void;
  labels: [string, string];
}) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      className="pill pill-line pill-sm self-start"
    >
      {open ? labels[1] : labels[0]}
      <I.ChevronDown
        size={16}
        style={{
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform var(--drill-transition)",
        }}
      />
    </button>
  );
}
