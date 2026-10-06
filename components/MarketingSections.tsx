"use client";
import Link from "next/link";
import { useState } from "react";
import { LeadForm } from "./LeadForm";

const stories = [
  {
    name: "Johnson Controls",
    logo: {
      src: "/assets/partners/johnson-controls.svg",
      width: 175,
      height: 60,
      style: "johnson",
    },
    type: "Customer story",
    title: "A closer look at enterprise CUI discovery",
    href: "https://teramis.us/teramis-blog/from-millions-of-false-positives-to-99-accuracy-how-johnson-controls-solved-its-cui-discovery-challenge",
  },
  {
    name: "FutureFeed",
    logo: {
      src: "/assets/partners/futurefeed-color.png",
      width: 337,
      height: 55,
      style: "futurefeed",
    },
    type: "Partner announcement",
    title: "Connecting discovery with compliance workflows",
    href: "https://teramis.us/teramis-blog/post/futurefeed-announces-partnership-with-teramis",
  },
  {
    name: "inDirectIT",
    logo: {
      src: "/assets/partners/indirectit.png",
      width: 600,
      height: 240,
      style: "indirectit",
    },
    type: "Partner announcement",
    title: "Bringing CUI discovery into client compliance work",
    href: "https://teramis.us/teramis-blog/post/teramis-partners-with-indirectit-to-strengthen-cmmc-compliance-with-automated-cui-discovery",
  },
];
function Heading({
  tag,
  title,
  children,
}: {
  tag: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="sec-title">
      <span className="eyebrow">{tag}</span>
      <h2>{title}</h2>
      {children ? <p className="muted">{children}</p> : null}
    </div>
  );
}
export function ProofStrip() {
  return (
    <section className="proof-strip">
      <div className="wrap">
        <span className="eyebrow">Published customer & partner stories</span>
        <div className="proof-links">
          {stories.map((s) => (
            <a key={s.name} href={s.href}>
              <div className={"proof-logo-frame proof-logo-" + s.logo.style}>
                <img
                  src={s.logo.src}
                  alt={s.name}
                  width={s.logo.width}
                  height={s.logo.height}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span>{s.type} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
export function LifecycleOverview() {
  return (
    <section id="workflow" className="sec">
      <div className="wrap stack-40">
        <Heading
          tag="The Teramis workflow"
          title="Find it. Prove it. Put it right. Keep watch."
        >
          One evidence trail from discovery to approved action and recurring
          review.
        </Heading>
        <div className="lifecycle-grid">
          {[
            [
              "01",
              "Find",
              "Examine approved sources for potential CUI.",
              "/platform/cui-discovery",
            ],
            [
              "02",
              "Prove",
              "Review findings and compare them with the documented boundary.",
              "/platform/evidence-validation",
            ],
            [
              "03",
              "Remediate",
              "Approve destinations and actions, verify transfers, and document changes.",
              "/platform/remediation",
            ],
            [
              "04",
              "Monitor",
              "Rescan to identify new findings, spillage, and boundary drift.",
              "/platform/ongoing-cui-monitoring",
            ],
          ].map(([n, title, text, href]) => (
            <Link href={href} key={n} className="card lifecycle-card">
              <span className="mono-label">{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="text-link">Explore {title.toLowerCase()} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
export function RemediationPreview({
  fileName = "Engineering_Notes_Unmarked.pdf",
}: {
  fileName?: string;
}) {
  const [step, setStep] = useState(0);
  const [approved, setApproved] = useState(false);
  const stages = ["Review", "Approve", "Verify", "Document"];
  return (
    <div className="remediation-preview card">
      <div className="spread">
        <strong>Remedius workflow preview</strong>
        <span className="tag-dashed">SYNTHETIC DEMO</span>
      </div>
      <div className="row-gap workflow-steps">
        {stages.map((s, i) => (
          <button
            key={s}
            className={"pill " + (step === i ? "pill-accent" : "pill-line")}
            aria-pressed={step === i}
            disabled={i > 1 && !approved}
            onClick={() => setStep(i)}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>
      <div className="remediation-stage" aria-live="polite">
        {step === 0 ? (
          <>
            <h3>Review the finding</h3>
            <p className="mono">{fileName}</p>
            <p>
              A reviewer has identified an exception outside the documented
              boundary. Confirm the evidence and choose the authorized
              destination.
            </p>
            <button className="pill pill-accent" onClick={() => setStep(1)}>
              Review the proposed action →
            </button>
          </>
        ) : step === 1 ? (
          <>
            <h3>Your team approves the action.</h3>
            <dl className="demo-dl">
              <div>
                <dt>Destination</dt>
                <dd>Authorized enclave / Engineering</dd>
              </div>
              <div>
                <dt>Source handling</dt>
                <dd>
                  Replace the unauthorized copy with a tombstone after
                  successful verification.
                </dd>
              </div>
            </dl>
            <label className="check-label">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
              />
              Approve this illustrative action
            </label>
            <button
              className="pill pill-accent"
              disabled={!approved}
              onClick={() => setStep(2)}
            >
              Preview verification →
            </button>
          </>
        ) : step === 2 ? (
          <>
            <h3>Verify before addressing the source.</h3>
            <p>
              The example transfer preserves the folder structure. Matching
              source and destination hashes demonstrate successful verification.
            </p>
            <dl className="demo-dl">
              <div>
                <dt>Source SHA-256</dt>
                <dd className="mono">7ad0…c28e (illustrative)</dd>
              </div>
              <div>
                <dt>Destination SHA-256</dt>
                <dd className="mono">7ad0…c28e (illustrative)</dd>
              </div>
            </dl>
            <button className="pill pill-accent" onClick={() => setStep(3)}>
              View the example record →
            </button>
          </>
        ) : (
          <>
            <h3>A record your team can review.</h3>
            <p>
              The manifest records the source, approved destination,
              verification result, source handling, and review status. Conflicts
              or failed transfers need review.
            </p>
            <a
              href="/samples/remediation-manifest.csv"
              download
              className="pill pill-accent"
            >
              Download example manifest
            </a>
            <button
              className="text-link"
              onClick={() => {
                setStep(0);
                setApproved(false);
              }}
            >
              Reset preview
            </button>
          </>
        )}
      </div>
      <p className="small muted">
        This preview changes demo state only. Customer actions and destinations
        require authorized approval.
      </p>
    </div>
  );
}
export function RemediationSection() {
  return (
    <section id="remediation" className="band">
      <div className="wrap split-section">
        <div className="stack-18">
          <Heading
            tag="Remedius / approved action"
            title="Finding CUI is the beginning."
          >
            Connect validated findings to controlled movement, transfer
            verification, source handling, and a documented record.
          </Heading>
          <ul className="plain-list">
            <li>Preserve source folder structures.</li>
            <li>Verify transfers before removing source files.</li>
            <li>
              Record tombstones, conflicts, failures, manifests, and logs.
            </li>
            <li>Rescan to see what remains or returns.</li>
          </ul>
          <Link href="/platform/remediation" className="text-link">
            Explore remediation →
          </Link>
        </div>
        <RemediationPreview />
      </div>
    </section>
  );
}
export function DeploymentSection() {
  return (
    <section id="deployment" className="sec">
      <div className="wrap stack-40">
        <Heading
          tag="Sources / deployment"
          title="Start with the data you actually use."
        >
          Scanning and analysis are performed within the customer-controlled
          environment. Your team defines the approved discovery scope.
        </Heading>
        <div className="lifecycle-grid">
          {[
            [
              "Microsoft 365",
              "SharePoint, OneDrive, Exchange, email and attachments.",
            ],
            [
              "File systems & endpoints",
              "Network shares, distributed endpoints, project folders and legacy storage.",
            ],
            [
              "Complex content",
              "Engineering and CAD content, PDFs, scans, images and archives.",
            ],
            [
              "Technical planning",
              "Confirm permissions, connectivity, source coverage, file types and scan frequency before deployment.",
            ],
          ].map(([title, text]) => (
            <div className="card lifecycle-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="note">
          Supported configurations vary by environment. Confirm exact coverage,
          access requirements, and data handling during technical planning.
        </div>
        <Link
          href="/platform/deployment-and-data-sources"
          className="text-link"
        >
          Plan deployment and data sources →
        </Link>
      </div>
    </section>
  );
}
export function AudienceSection() {
  return (
    <section id="solutions" className="band">
      <div className="wrap stack-40">
        <Heading
          tag="Who we help"
          title="Different environments. Decisions built on evidence."
        />
        <div className="lifecycle-grid">
          {[
            [
              "Small business",
              "Find the CUI footprint before investing in scope, licenses, or an enclave.",
              "/solutions/by-organization/small-business",
            ],
            [
              "Enterprise",
              "Investigate distributed storage, engineering content, and complex Microsoft 365 environments.",
              "/solutions/by-organization/enterprise",
            ],
            [
              "Government",
              "Improve CUI visibility before publication, sharing, and external-release workflows.",
              "/solutions/government-agencies",
            ],
            [
              "Partners & advisors",
              "Bring technical findings into client scoping, boundary validation, and recurring review.",
              "/solutions/by-organization/compliance-advisors",
            ],
          ].map(([title, text, href]) => (
            <Link className="card lifecycle-card" href={href} key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="text-link">Find your solution →</span>
            </Link>
          ))}
        </div>
        <div className="row-gap">
          {[
            ["CUI scoping", "/solutions/cmmc-scoping"],
            ["Boundary validation", "/solutions/cui-boundary-validation"],
            ["Migration support", "/solutions/migration-support"],
            [
              "Spillage monitoring",
              "/solutions/cui-remediation-spillage-monitoring",
            ],
            [
              "Post-incident review",
              "/solutions/post-incident-cui-scoping-and-discovery-teramis",
            ],
            ["Supply chain & M&A", "/solutions/supply-chain-ma"],
          ].map(([name, href]) => (
            <Link key={href} href={href} className="pill pill-line">
              {name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
export function EvidenceSection() {
  return (
    <section id="evidence" className="sec">
      <div className="wrap stack-40">
        <Heading
          tag="Evidence / example deliverables"
          title="See the record behind the finding."
        >
          These downloadable examples contain fictional data. They illustrate
          what a review conversation can look like, rather than a production
          report specification.
        </Heading>
        <div className="resource-grid">
          {[
            [
              "Finding inventory",
              "File, location, reason for review, and boundary status.",
              "/samples/findings.csv",
            ],
            [
              "Boundary exception summary",
              "A short readout connecting findings to documented scope.",
              "/samples/boundary-summary.txt",
            ],
            [
              "Remediation manifest",
              "Approved destination, verification result, and source handling.",
              "/samples/remediation-manifest.csv",
            ],
          ].map(([title, text, href]) => (
            <a href={href} download key={href} className="card resource-card">
              <span className="tag-dashed">SYNTHETIC EXAMPLE</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="text-link">Download example ↓</span>
            </a>
          ))}
        </div>
        <Link href="/platform/evidence-validation" className="text-link">
          Explore evidence and validation →
        </Link>
      </div>
    </section>
  );
}
export function CustomerStories() {
  return (
    <section id="stories" className="band">
      <div className="wrap stack-40">
        <Heading
          tag="Customer & partner perspectives"
          title="Read the published stories."
        />
        <div className="resource-grid">
          {stories.map((s) => (
            <a href={s.href} key={s.href} className="card resource-card">
              <span className="eyebrow">{s.type}</span>
              <h3>{s.name}</h3>
              <p>{s.title}</p>
              <span className="text-link">Read on teramis.us ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
export function EngagementOptions() {
  return (
    <section id="engagements" className="sec">
      <div className="wrap stack-40">
        <Heading
          tag="Engagement options"
          title="Start with the decision you need to make."
        >
          Discuss your sources, data volume, review goals, and scan frequency to
          scope the right engagement.
        </Heading>
        <div className="resource-grid">
          {[
            [
              "Readiness conversation",
              "Understand your discovery questions and discuss technical fit.",
              "Request an assessment",
              "/cui-discovery-readiness-assessment-teramis",
            ],
            [
              "Discovery & ongoing review",
              "Explore discovery, validation, approved remediation, and recurring monitoring.",
              "Request a demo",
              "/request-a-demo",
            ],
            [
              "Partner collaboration",
              "Discuss how technical evidence can support your client services.",
              "Become a partner",
              "/partners/become-a-partner",
            ],
          ].map(([title, text, cta, href]) => (
            <div className="card resource-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href={href} className="pill pill-accent">
                {cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function FaqSection() {
  return (
    <section id="faq" className="band">
      <div className="wrap split-section">
        <Heading tag="Common questions" title="Know what to expect." />
        <div>
          {[
            [
              "Does our data leave our environment?",
              "Teramis is deployed within the customer security boundary, with scanning and analysis inside the customer-controlled environment. Confirm the precise architecture and handling requirements during technical planning.",
            ],
            [
              "Who decides whether a finding is CUI?",
              "Authorized customer personnel and their advisors make final classification and handling decisions. Findings and validation workflows support that review.",
            ],
            [
              "Who approves remediation?",
              "The customer determines the findings that require action, the authorized destination, and the approved action and schedule.",
            ],
            [
              "Is monitoring continuous or real time?",
              "Monitoring uses recurring scans. Frequency and coverage depend on the agreed deployment and monitoring plan.",
            ],
            [
              "Does Teramis replace DLP or certify compliance?",
              "Teramis complements security, governance, and compliance tools with discovery and evidence. It does not certify organizations or guarantee an assessment outcome.",
            ],
          ].map(([q, a]) => (
            <details key={q} className="faq-item">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
          <Link href="/resources/faqs" className="text-link">
            Read all FAQs →
          </Link>
        </div>
      </div>
    </section>
  );
}
export function ContactSection() {
  return (
    <section id="contact" className="sec">
      <div className="wrap split-section">
        <div className="stack-18">
          <Heading
            tag="Talk with Teramis"
            title="Make your documented boundary match reality."
          >
            See how discovery, validation, approved remediation, and recurring
            scans can support your organization.
          </Heading>
          <Link
            href="/cui-discovery-readiness-assessment-teramis"
            className="text-link"
          >
            Start with a readiness assessment →
          </Link>
          <Link href="/partners/become-a-partner" className="text-link">
            Discuss partner opportunities →
          </Link>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
export function MonitoringComparison() {
  const [scan, setScan] = useState<"before" | "after">("before");
  return (
    <div className="card feat-card stack-18">
      <span className="tag-dashed">SYNTHETIC SCAN COMPARISON</span>
      <div className="row-gap">
        <button
          className={
            "pill " + (scan === "before" ? "pill-accent" : "pill-line")
          }
          aria-pressed={scan === "before"}
          onClick={() => setScan("before")}
        >
          Before remediation
        </button>
        <button
          className={"pill " + (scan === "after" ? "pill-accent" : "pill-line")}
          aria-pressed={scan === "after"}
          onClick={() => setScan("after")}
        >
          Follow-up scan
        </button>
      </div>
      <div aria-live="polite">
        <h3>
          {scan === "before"
            ? "27 outside-boundary findings"
            : "2 findings need follow-up"}
        </h3>
        <p>
          {scan === "before"
            ? "Field laptops contain findings outside the documented boundary. Review the evidence before approving any action."
            : "25 illustrative exceptions are resolved. Two remain for review; three new potential findings were identified inside the approved location."}
        </p>
      </div>
      <Link href="/platform/ongoing-cui-monitoring" className="text-link">
        Explore recurring monitoring →
      </Link>
    </div>
  );
}
