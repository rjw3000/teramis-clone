"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Close, Menu, Moon, Sun } from "./icons";

const sectionLinks = [
  ["Platform", "features"],
  ["Explorer", "explore"],
  ["Testimonials", "testimonials"],
  ["Plans", "pricing"],
  ["Contact", "contact"],
];

const routeLinks = [
  ["Platform", "/platform"],
  ["Solutions", "/solutions"],
  ["Partners", "/partners"],
  ["Resources", "/resources"],
  ["Company", "/company"],
];

export const THEME_KEY = "teramis-dd-theme";

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    const onResize = () => window.innerWidth >= 768 && setOpen(false);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!home || !("IntersectionObserver" in window)) return;
    const so = new IntersectionObserver(
      (es) => es.forEach((en) => en.isIntersecting && setActive(en.target.getAttribute("data-section"))),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("[data-section]").forEach((el) => so.observe(el));
    return () => so.disconnect();
  }, [home]);

  const toggleTheme = () => {
    const t = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    document.documentElement.dataset.theme = t;
    setTheme(t);
  };

  const links = home
    ? sectionLinks.map(([label, id]) => ({
        label,
        href: "#" + id,
        current: active === id,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setOpen(false);
          scrollToId(id);
        },
      }))
    : routeLinks.map(([label, href]) => ({
        label,
        href,
        current: pathname === href || pathname.startsWith(href + "/"),
        onClick: undefined,
      }));

  const themeLabel = theme === "dark" ? "Use light theme" : "Use dark theme";

  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link href="/" aria-label="Teramis — home" className="hdr-logo">
          <img src="/assets/logo.avif" alt="Teramis" width={110} height={34} />
        </Link>
        <nav aria-label="Primary" className="hdr-nav">
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={l.onClick} className={"hdr-link" + (l.current ? " on" : "")} aria-current={l.current ? "page" : undefined}>
              {l.label}
              <span className="hdr-bar" />
            </Link>
          ))}
        </nav>
        <div className="hdr-tools">
          <button className="icon-btn" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
          <Link className="pill pill-accent hdr-demo" href="/request-a-demo">Request a Demo</Link>
          <button className="icon-btn hdr-menu" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav">
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {open ? (
        <div id="mobile-nav" className="mnav">
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={l.onClick} className={"mnav-link" + (l.current ? " on" : "")}>
              {l.label}
              <ChevronRight />
            </Link>
          ))}
          <Link className="pill pill-accent mnav-demo" href="/request-a-demo">Request a Demo</Link>
        </div>
      ) : null}
    </header>
  );
}
