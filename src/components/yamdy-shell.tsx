import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BadgeCheck,
  Bell,
  CircleHelp,
  HeartPulse,
  Inbox,
  Lightbulb,
  Megaphone,
  Percent,
  Settings,
  Store,
  Tags,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { signOut, type WorkspaceSummary } from "../lib/auth";

export function BrandMark() {
  return (
    <span className="brand-mark">
      <span className="brand-mark__tile">Y</span>
      <span className="brand-mark__copy">
        <strong>Yamdy</strong>
        <small>يمدي · KSA Ops</small>
      </span>
    </span>
  );
}

export function OnboardingChrome({ step, children }: { step: 2 | 3; children: ReactNode }) {
  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <div className="onboarding-header__inner">
          <BrandMark />
          <nav aria-label="Onboarding navigation" className="onboarding-header__nav">
            <span>Overview</span>
            <span>Brand Profile</span>
            <span className="is-active">Aggregators</span>
            <span>POS Setup</span>
            <span>Compliance</span>
          </nav>
          <div className="header-utilities">
            <span className="language-chip">
              EN <span>│</span> العربية
            </span>
            <CircleHelp size={18} />
            <span className="user-avatar">Y</span>
          </div>
        </div>
      </header>
      <div className="step-rail">
        <div className="step-rail__inner">
          <div className="step-rail__eyebrow">
            RESTAURANT ONBOARDING <span>/</span> <strong>KSA Aggregator Bridge</strong>
          </div>
          <ol className="steps">
            <li className="is-done">
              <span>✓</span>1. Workspace
            </li>
            <li className={step === 3 ? "is-done" : "is-current"}>
              <span>{step === 3 ? "✓" : "2"}</span>2. Connect HungerStation
            </li>
            <li className={step === 3 ? "is-current" : ""}>
              <span>3</span>3. Import Business
            </li>
          </ol>
          <span className="step-rail__note">✦ Secure setup</span>
        </div>
      </div>
      <main className="onboarding-main">{children}</main>
      <footer className="onboarding-footer">
        <span>© Yamdy · Restaurant operations</span>
        <span>Development connection · No production API calls</span>
      </footer>
    </div>
  );
}

const navigation = [
  { label: "Opportunity Inbox", to: "/app", icon: Inbox },
  { label: "Opportunities", to: "/app/opportunities", icon: Lightbulb },
  { label: "Restaurant Health", to: "/app/health", icon: HeartPulse },
  { label: "Listings", to: "/app/listings", icon: Store },
  { label: "Pricing", to: "/app/pricing", icon: Wallet },
  { label: "Promotions", to: "/app/promotions", icon: Percent },
  { label: "Bundles", to: "/app/bundles", icon: Tags },
  { label: "Marketing", to: "/app/marketing", icon: Megaphone },
  { label: "Performance", to: "/app/performance", icon: TrendingUp },
  { label: "Approvals", to: "/app/approvals", icon: BadgeCheck },
  { label: "Activity", to: "/app/activity", icon: Activity },
  { label: "Settings", to: "/app/settings", icon: Settings },
] as const;

export function AppShell({
  workspace,
  children,
}: {
  workspace: WorkspaceSummary;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <BrandMark />
        <div className="workspace-switcher">
          <span className="workspace-switcher__icon">{workspace.name[0]?.toUpperCase()}</span>
          <span>
            <strong>{workspace.name}</strong>
            <small>Workspace · {workspace.role.replaceAll("_", " ")}</small>
          </span>
        </div>
        <nav aria-label="Main navigation">
          {navigation.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={
                "sidebar-link" +
                (pathname === to || (to !== "/app" && pathname.startsWith(to + "/"))
                  ? " is-active"
                  : "")
              }
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="demo-label">Demo workspace · no live channel actions</span>
          <button
            type="button"
            onClick={() => {
              void signOut().then(() => {
                window.location.href = "/signin";
              });
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="app-body">
        <header className="app-topbar">
          <span>{workspace.name}</span>
          <div className="header-utilities">
            <span className="language-chip">
              EN <span>│</span> العربية
            </span>
            <Bell size={18} />
            <CircleHelp size={18} />
            <span className="user-avatar">{workspace.name[0]?.toUpperCase()}</span>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
