import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, CloudDownload, MapPin, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { OnboardingChrome } from "../../components/yamdy-shell";
import { useWorkspace } from "../../hooks/use-workspace";
import { mockHungerStationAdapter } from "../../integrations/hungerstation/mock";
import type { BusinessPreview } from "../../integrations/aggregator";
import { importMockBusiness, loadMockConnection } from "../../lib/onboarding";

export const Route = createFileRoute("/onboarding/import")({ component: ImportBusiness });

function ImportBusiness() {
  const state = useWorkspace();
  const navigate = useNavigate();
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [preview, setPreview] = useState<BusinessPreview | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!state.loading && state.workspace) {
      void Promise.all([
        loadMockConnection(state.workspace.id),
        mockHungerStationAdapter.previewBusiness(),
      ])
        .then(([connection, business]) => {
          setConnectionId(connection?.mode === "mock" ? connection.id : null);
          setPreview(business);
          setSelected(
            business.branches
              .filter((branch) => branch.selectedByDefault)
              .map((branch) => branch.code),
          );
        })
        .catch((cause) => setError(cause.message));
    }
  }, [state]);
  async function importSelected() {
    if (state.loading || !state.workspace || !connectionId) return;
    setBusy(true);
    setError("");
    try {
      await importMockBusiness(state.workspace.id, connectionId, selected);
      void navigate({ to: "/app" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Import failed.");
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
    <OnboardingChrome step={3}>
      <div className="onboarding-heading">
        <span className="eyebrow">STEP 03 / BUSINESS IMPORT · DEMO PREVIEW</span>
        <h1>Explore a sample HungerStation business</h1>
        <p>
          The approved screen's import flow is represented with labeled sample branches. Yamdy has
          not discovered or synced a live business.
        </p>
      </div>
      {!connectionId ? (
        <div className="notice">
          <strong>Demo connection needed</strong>
          <p>Set up the mock connection before importing sample branches.</p>
          <Link to="/onboarding/connect" className="text-link">
            Back to connection →
          </Link>
        </div>
      ) : (
        <>
          <div className="notice success import-success">
            <CheckCircle2 size={22} />
            <div>
              <strong>Demo connection ready for import</strong>
              <p>Review the sample branches before creating them in this workspace.</p>
            </div>
            <span className="demo-label">SAMPLE DATA</span>
          </div>
          <div className="business-summary">
            <div className="business-summary__identity">
              <span className="hs-badge">
                HUNGER
                <br />
                STATION
              </span>
              <div>
                <h2>{preview?.brandName ?? "Loading…"}</h2>
                <p dir="rtl">{preview?.brandNameAr}</p>
                <span className="status-pill">Mock adapter · local data</span>
              </div>
            </div>
            <div className="summary-stats">
              <div>
                <small>BRANCHES</small>
                <strong>{preview?.branches.length ?? "—"}</strong>
                <span>Sample locations</span>
              </div>
              <div>
                <small>MENU ITEMS</small>
                <strong>142</strong>
                <span>Illustrative count</span>
              </div>
              <div>
                <small>API MODE</small>
                <strong>Mock</strong>
                <span>No external access</span>
              </div>
            </div>
          </div>
          <div className="import-grid">
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>Branches to Import</h2>
                  <p>Select sample locations for your Yamdy workspace.</p>
                </div>
                <span className="demo-label">{selected.length} SELECTED</span>
              </div>
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={!!preview && selected.length === preview.branches.length}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? (preview?.branches.map((branch) => branch.code) ?? [])
                        : [],
                    )
                  }
                />{" "}
                Select all ({selected.length} selected)
              </label>
              <div className="branch-list">
                {preview?.branches.map((branch) => (
                  <label key={branch.code} className="branch-option">
                    <input
                      type="checkbox"
                      checked={selected.includes(branch.code)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, branch.code]
                            : current.filter((code) => code !== branch.code),
                        )
                      }
                    />
                    <span className="branch-icon">
                      <Store size={20} />
                    </span>
                    <span className="branch-copy">
                      <strong>{branch.name}</strong>
                      <small>
                        <MapPin size={13} /> {branch.city} · {branch.nameAr}
                      </small>
                    </span>
                    <span className="branch-count">{branch.menuItems} sample SKUs</span>
                  </label>
                ))}
              </div>
            </section>
            <aside className="panel sync-panel">
              <div className="section-icon">
                <CloudDownload size={22} />
              </div>
              <h2>Synchronization Scope</h2>
              <p>
                This milestone saves canonical brand and branch records plus demo aggregator
                mappings. Catalog and live sync are planned for Milestone 2.
              </p>
              <ul>
                <li>
                  <CheckCircle2 size={18} /> Brand and selected branches
                </li>
                <li>
                  <CheckCircle2 size={18} /> Workspace-owned aggregator mappings
                </li>
                <li>
                  <CheckCircle2 size={18} /> Explicit demo provenance
                </li>
              </ul>
              <div className="access-note">
                <strong>Instant margin &amp; menu diagnostic</strong>
                <p>
                  The Stitch preview depicts this analysis. It will require verified catalog and
                  cost data in a later milestone.
                </p>
              </div>
            </aside>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="import-actions">
            <Link to="/onboarding/connect" className="secondary-button">
              <ArrowLeft size={17} /> Back
            </Link>
            <button
              className="primary-button"
              type="button"
              disabled={busy || selected.length === 0}
              onClick={() => {
                void importSelected();
              }}
            >
              {busy ? "Importing sample business…" : "Import sample business"}{" "}
              <ArrowRight size={17} />
            </button>
          </div>
        </>
      )}
    </OnboardingChrome>
  );
}
