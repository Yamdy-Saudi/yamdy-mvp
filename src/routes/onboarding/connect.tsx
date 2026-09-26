import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  LockKeyhole,
  ShieldCheck,
  Store,
  Unplug,
} from "lucide-react";
import { useEffect, useState } from "react";
import { OnboardingChrome } from "../../components/yamdy-shell";
import { useWorkspace } from "../../hooks/use-workspace";
import { connectMockHungerStation, loadMockConnection } from "../../lib/onboarding";

export const Route = createFileRoute("/onboarding/connect")({ component: Connect });

function Connect() {
  const state = useWorkspace();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!state.loading && state.workspace) {
      void loadMockConnection(state.workspace.id)
        .then((value) => setConnected(value?.mode === "mock"))
        .catch((cause) => setError(cause.message));
    }
  }, [state]);
  async function connect() {
    if (state.loading || !state.workspace) return;
    setBusy(true);
    setError("");
    try {
      await connectMockHungerStation(state.workspace.id);
      setConnected(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not set up demo connection.");
    } finally {
      setBusy(false);
    }
  }
  if (state.loading) return <div className="loading-state">Loading your workspace…</div>;
  if (state.error) return <div className="loading-state form-error">{state.error}</div>;
  if (!state.workspace)
    return (
      <div className="loading-state">
        <Link to="/signup">Create a workspace first</Link>
      </div>
    );
  return (
    <OnboardingChrome step={2}>
      <div className="onboarding-heading">
        <span className="eyebrow">STEP 02 / AGGREGATOR CONNECTION</span>
        <h1>Connect your HungerStation business</h1>
        <p>
          Prepare your workspace for a secure channel connection. Partner credentials and restaurant
          access will be confirmed separately.
        </p>
      </div>
      <div className="onboarding-grid">
        <section className="panel connection-panel">
          <div className="panel-topline">
            <span className="hs-badge">
              HUNGER
              <br />
              STATION
            </span>
            <span className="demo-label">DEVELOPMENT MODE</span>
          </div>
          <h2>Set up your channel</h2>
          <p className="muted">
            The approved design shows a direct connection. For this milestone, a mock adapter lets
            you explore onboarding without HungerStation credentials or live API calls.
          </p>
          <div className="connection-illustration">
            <div className="connection-node">
              <Store size={28} />
              <strong>{state.workspace.name}</strong>
            </div>
            <span className="connection-line" />
            <div className="connection-node yellow">
              <Cloud size={28} />
              <strong>HungerStation</strong>
            </div>
          </div>
          {connected ? (
            <div className="notice success">
              <CheckCircle2 size={22} />
              <div>
                <strong>Demo connection ready</strong>
                <p>No production account has been connected.</p>
              </div>
            </div>
          ) : (
            <div className="notice">
              <Unplug size={22} />
              <div>
                <strong>Not connected to a live account</strong>
                <p>You can continue using a sample business.</p>
              </div>
            </div>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="button-row">
            <button
              type="button"
              disabled={busy || connected}
              onClick={() => {
                void connect();
              }}
              className="primary-button"
            >
              {busy ? "Setting up…" : connected ? "Demo connected" : "Connect demo business"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                void navigate({ to: "/app" });
              }}
            >
              Set up later
            </button>
          </div>
          {connected && (
            <Link to="/onboarding/import" className="text-link next-link">
              Proceed to Step 3 <ArrowRight size={17} />
            </Link>
          )}
        </section>
        <aside className="panel access-panel">
          <div className="section-icon">
            <ShieldCheck size={23} />
          </div>
          <h2>What Yamdy will request access to</h2>
          <p>
            Once partner access is available, authorized connections can support the documented
            operations below.
          </p>
          <ul>
            <li>
              <Store size={19} />
              <span>Read vendor catalogs and categories</span>
            </li>
            <li>
              <Cloud size={19} />
              <span>Read branch status and order history where permitted</span>
            </li>
            <li>
              <LockKeyhole size={19} />
              <span>Keep client credentials and tokens server-side</span>
            </li>
          </ul>
          <div className="access-note">
            <strong>Human control stays in place</strong>
            <p>
              Publishing changes is outside this onboarding milestone. No production HungerStation
              calls are made.
            </p>
          </div>
        </aside>
      </div>
    </OnboardingChrome>
  );
}
