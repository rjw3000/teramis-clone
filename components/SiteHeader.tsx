"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Close, Menu } from "./icons";
const links = [
  ["Platform", "/platform"],
  ["Explorer", "/#explore"],
  ["Solutions", "/solutions"],
  ["Partners", "/partners"],
  ["Resources", "/resources"],
  ["Contact", "/contact-us"],
];
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth >= 1100) setOpen(false);
    };
    const outside = (e: PointerEvent) => {
      if (
        !menu.current?.contains(e.target as Node) &&
        !toggle.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  const current = (href: string) =>
    !href.includes("#") &&
    (pathname === href || pathname.startsWith(href + "/"));
  return (
    <header className="hdr hdr-cinematic">
      <div className="wrap hdr-in">
        <Link href="/" aria-label="Teramis — home" className="hdr-logo">
          <img src="/assets/logo.avif" alt="Teramis" width={110} height={34} />
        </Link>
        <nav aria-label="Primary" className="hdr-nav">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={"hdr-link" + (current(href) ? " on" : "")}
              aria-current={current(href) ? "page" : undefined}
            >
              {label}
              <span className="hdr-bar" />
            </Link>
          ))}
        </nav>
        <div className="hdr-tools">
          <Link className="pill pill-accent hdr-demo" href="/request-a-demo">
            Request a Demo
          </Link>
          <button
            ref={toggle}
            className="icon-btn hdr-menu"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {open ? (
        <div ref={menu} id="mobile-nav" className="mnav">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={"mnav-link" + (current(href) ? " on" : "")}
              aria-current={current(href) ? "page" : undefined}
            >
              {label}
              <ChevronRight />
            </Link>
          ))}
          <Link
            className="pill pill-accent mnav-demo"
            href="/request-a-demo"
            onClick={() => setOpen(false)}
          >
            Request a Demo
          </Link>
        </div>
      ) : null}
    </header>
  );
}
