import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="page branded-page">
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">TERAMIS / 404</span>
          <h1>Outside the known boundary.</h1>
          <p className="page-lead">
            This page could not be found. Explore the platform or search the
            published resources to get back on track.
          </p>
          <div className="row-gap">
            <Link href="/" className="pill pill-accent">
              Return home →
            </Link>
            <Link href="/resources" className="pill pill-line">
              Explore resources
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
