import { Link } from "@tanstack/react-router";
import { Info, RotateCw, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useDemo } from "./demo-provider";
import type { DemoData } from "../lib/demo";

export function formatSar(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-SA", {
    dateStyle: "medium",
    timeZone: "Asia/Riyadh",
  }).format(new Date(value));
}

export function DemoNotice({
  children,
  title = "Demo workspace",
}: {
  children?: ReactNode;
  title?: string;
}) {
  return (
    <div className="demo-notice" role="note">
      <Sparkles size={17} />
      <div>
        <strong>{title}</strong>
        <span>
          {children ??
            "All figures and recommendations on this page are sample data. No HungerStation action is sent."}
        </span>
      </div>
    </div>
  );
}

export function AcloConceptBanner({
  label = "INTERNAL CREATIVE CONCEPT",
  imagePath = "/aclo-demo/hero.png",
  headline = "A little box for every gathering.",
  description = "Mini sandwiches, sweet bites and drinks inspired by Aclo’s historical orders.",
}: {
  label?: string;
  imagePath?: string;
  headline?: string;
  description?: string;
}) {
  return (
    <div className="aclo-concept-banner">
      <img src={imagePath} alt="Illustrative Aclo food and drink concept" />
      <div className="aclo-concept-copy">
        <small>{label}</small>
        <strong>{headline}</strong>
        <span>{description}</span>
        <em>Generated concept image · no live campaign or verified menu listing</em>
      </div>
    </div>
  );
}

export function Screen({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { workspace } = useDemo();
  return (
    <div className="demo-screen">
      <header className="demo-page-heading">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="demo-page-actions">{actions}</div>}
      </header>
      {workspace.reportingMode === "client_export" ? (
        <DemoNotice title="Historical client report + demo examples">
          Order figures come from the dated HungerStation export. Recommendations, catalog,
          marketing, and approval examples are simulations; no live channel action is sent.
        </DemoNotice>
      ) : (
        <DemoNotice />
      )}
      {children}
    </div>
  );
}

export function DataState({ children }: { children: ReactNode }) {
  const { data, loading, error, refresh, workspace } = useDemo();
  if (loading)
    return (
      <div className="demo-state">
        <RotateCw className="spin" size={24} /> Loading your workspace data…
      </div>
    );
  if (error)
    return (
      <div className="demo-state error">
        <Info size={22} />
        <strong>Data could not load</strong>
        <span>{error}</span>
        <button className="secondary-button" onClick={() => void refresh()}>
          Try again
        </button>
      </div>
    );
  if (!data?.branches.length)
    return (
      <div className="demo-state">
        <Info size={22} />
        <strong>Import a sample business</strong>
        <span>{workspace.name} has no branches yet.</span>
        <Link className="primary-button" to="/onboarding/connect">
          Continue onboarding
        </Link>
      </div>
    );
  return <>{children}</>;
}

export function DemoReady({ children }: { children: (data: DemoData) => ReactNode }) {
  const { data } = useDemo();
  return <DataState>{data ? children(data) : null}</DataState>;
}

export function Panel({
  title,
  aside,
  children,
  className = "",
}: {
  title?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`demo-panel ${className}`}>
      {(title || aside) && (
        <div className="demo-panel-heading">
          {title && <h2>{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  detail,
  tone = "green",
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: "green" | "purple" | "orange";
}) {
  return (
    <div className={`demo-stat demo-stat--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "orange" | "red" | "purple";
}) {
  return <span className={`demo-pill demo-pill--${tone}`}>{children}</span>;
}

export function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="demo-empty">
      <Info size={22} />
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}

export function BarChart({
  values,
  labels,
  ariaLabel = "Sample performance bar chart",
}: {
  values: readonly number[];
  labels?: readonly string[];
  ariaLabel?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="demo-bars" role="img" aria-label={ariaLabel}>
      {values.map((value, index) => (
        <div
          key={index}
          className="demo-bars__item"
          title={`${labels?.[index] ?? `Day ${index + 1}`}: ${value}`}
        >
          <span style={{ height: `${Math.max(6, (value / max) * 100)}%` }} />
          <small>{labels?.[index] ?? ""}</small>
        </div>
      ))}
    </div>
  );
}

export function useDemoAction() {
  const { refresh } = useDemo();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function run(operation: () => Promise<unknown>, message = "Demo workspace updated.") {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await operation();
      await refresh();
      setSuccess(message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, success, run };
}

export function ActionFeedback({ error, success }: { error?: string; success?: string }) {
  return (
    <>
      {error && (
        <div role="alert" className="demo-action-error">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="demo-action-success">
          {success}
        </div>
      )}
    </>
  );
}
