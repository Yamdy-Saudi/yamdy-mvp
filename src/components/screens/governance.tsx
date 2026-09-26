import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useDemo } from "../demo-provider";
import {
  ActionFeedback,
  DemoReady,
  Empty,
  formatDate,
  Panel,
  Pill,
  Screen,
  Stat,
  useDemoAction,
} from "../demo-ui";
import { decideApproval } from "../../lib/demo";
import { getSupabase } from "../../lib/supabase";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

function exportAudit(
  rows: {
    created_at: string;
    action: string;
    entity_kind: string;
    entity_id: string | null;
    actor_user_id: string | null;
  }[],
) {
  const csv = [
    "Created at,Action,Entity,Entity ID,Actor",
    ...rows.map((row) =>
      [row.created_at, row.action, row.entity_kind, row.entity_id, row.actor_user_id]
        .map(csvCell)
        .join(","),
    ),
  ].join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "yamdy-demo-audit.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export function ApprovalsScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [tab, setTab] = useState("pending");
  const action = useDemoAction();
  return (
    <DemoReady>
      {(data) => {
        const rows = data.approvals.filter((a) => tab === "all" || a.status === tab);
        const current = data.approvals.find((a) => a.id === selected) ?? rows[0];
        const opp = current
          ? data.opportunities.find((o) => o.id === current.opportunity_id)
          : null;
        const execution = current
          ? data.executions.find((e) => e.approval_id === current.id)
          : null;
        return (
          <Screen
            eyebrow="HUMAN GOVERNANCE"
            title="Approvals & Activity"
            subtitle="Review internal recommendations. Approval and channel publication remain distinct."
            actions={
              <Link className="secondary-button" to="/app/activity">
                Open activity log <ArrowRight size={15} />
              </Link>
            }
          >
            <div className="demo-grid demo-grid--three">
              <Stat
                label="Pending review"
                value={data.approvals.filter((a) => a.status === "pending").length}
                tone="orange"
              />
              <Stat
                label="Approved demos"
                value={data.approvals.filter((a) => a.status === "approved").length}
              />
              <Stat
                label="External confirmations"
                value="0"
                detail="No production channel access"
                tone="purple"
              />
            </div>
            <div className="demo-split">
              <Panel
                title="Approvals Queue"
                aside={
                  <div className="demo-filter-row">
                    {["pending", "approved", "rejected", "all"].map((name) => (
                      <button
                        className={`demo-filter${tab === name ? " is-active" : ""}`}
                        key={name}
                        onClick={() => {
                          setTab(name);
                          setSelected(null);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="demo-card-list">
                  {rows.length ? (
                    rows.map((approval) => {
                      const item = data.opportunities.find((o) => o.id === approval.opportunity_id);
                      return (
                        <button
                          key={approval.id}
                          className={`demo-approval-row${current?.id === approval.id ? " is-selected" : ""}`}
                          onClick={() => setSelected(approval.id)}
                        >
                          <div>
                            <strong>{item?.title ?? "Demo request"}</strong>
                            <small>
                              {item?.domain} · {formatDate(approval.created_at)}
                            </small>
                          </div>
                          <Pill
                            tone={
                              approval.status === "pending"
                                ? "orange"
                                : approval.status === "approved"
                                  ? "green"
                                  : "red"
                            }
                          >
                            {approval.status}
                          </Pill>
                          <ArrowRight size={17} />
                        </button>
                      );
                    })
                  ) : (
                    <Empty
                      title="No approvals in this view"
                      detail="Requests appear here after a recommendation is submitted."
                    />
                  )}
                </div>
              </Panel>
              <div className="demo-stack">
                <Panel title="Pricing Intervention">
                  <div className="demo-opportunity-top">
                    <Pill tone="purple">{opp?.domain ?? "Demo"}</Pill>
                    <Pill tone={current?.status === "pending" ? "orange" : "neutral"}>
                      {current?.status ?? "No selection"}
                    </Pill>
                  </div>
                  <h3>{opp?.title ?? "Select an approval"}</h3>
                  <p className="demo-help">
                    {opp?.description ?? "Choose an item from the queue to inspect its evidence."}
                  </p>
                  {opp && (
                    <div className="demo-kv">
                      <div>
                        <small>Branch scope</small>
                        <strong>
                          {data.branches.find((b) => b.id === current?.branch_id)?.name ?? "All"}
                        </strong>
                      </div>
                      <div>
                        <small>Requested by</small>
                        <strong>
                          {current?.requested_by ? "Workspace member" : "Seeded demo request"}
                        </strong>
                      </div>
                      <div>
                        <small>Source</small>
                        <strong>Demo fixture</strong>
                      </div>
                      <div>
                        <small>Channel state</small>
                        <strong>Not published</strong>
                      </div>
                    </div>
                  )}
                  <div className="demo-divider" />
                  <p className="demo-help">
                    A commercial requester cannot approve their own request. The seeded sample can
                    be reviewed by an authorized owner or general manager.
                  </p>
                  {current?.status === "pending" && (
                    <>
                      <label className="demo-field">
                        Reason or review note
                        <textarea
                          className="demo-textarea"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Record the reason for your decision"
                        />
                      </label>
                      <ActionFeedback error={action.error} success={action.success} />
                      <div className="demo-actions">
                        <button
                          className="primary-button"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(
                              () => decideApproval(current.id, "approved", reason),
                              "Approved as a demo simulation. Nothing was sent to HungerStation.",
                            )
                          }
                        >
                          Approve demo simulation
                        </button>
                        <button
                          className="secondary-button"
                          disabled={action.busy || reason.trim().length < 3}
                          onClick={() =>
                            void action.run(
                              () => decideApproval(current.id, "rejected", reason),
                              "Demo request rejected and audited.",
                            )
                          }
                        >
                          Reject with reason
                        </button>
                      </div>
                    </>
                  )}
                </Panel>
                <Panel title="Execution status">
                  <div className="demo-sample-card">
                    <span className="demo-icon-box">
                      <ShieldCheck size={20} />
                    </span>
                    <div>
                      <strong>{execution ? "Simulation completed" : "No execution intent"}</strong>
                      <p>
                        {execution?.explanation ?? "Approving a sample records a simulation only."}
                      </p>
                      <Pill tone="purple">External confirmation: not confirmed</Pill>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          </Screen>
        );
      }}
    </DemoReady>
  );
}

export function ActivityScreen() {
  const [filter, setFilter] = useState("all");
  return (
    <DemoReady>
      {(data) => {
        const rows = data.audit.filter((e) => filter === "all" || e.entity_kind === filter);
        return (
          <Screen
            eyebrow="AUDIT & EXECUTION"
            title="Activity Log"
            subtitle="Workspace actions with demo provenance and separate channel confirmation."
            actions={
              <button className="secondary-button" onClick={() => exportAudit(rows)}>
                Export visible CSV
              </button>
            }
          >
            <div className="demo-grid demo-grid--three">
              <Stat label="Audit events" value={data.audit.length} />
              <Stat label="Simulated executions" value={data.executions.length} tone="purple" />
              <Stat
                label="Failed channel pushes"
                value="Not applicable"
                detail="No external calls"
                tone="orange"
              />
            </div>
            <div className="demo-split">
              <Panel
                title="Recent Activity Log & Channel Execution Status"
                aside={
                  <div className="demo-filter-row">
                    {[
                      "all",
                      "opportunity",
                      "approval",
                      "product",
                      "promotion",
                      "bundle",
                      "campaign",
                    ].map((name) => (
                      <button
                        className={`demo-filter${filter === name ? " is-active" : ""}`}
                        key={name}
                        onClick={() => setFilter(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="demo-card-list">
                  {rows.length ? (
                    rows.map((event) => (
                      <div className="demo-sample-card" key={event.id}>
                        <span className="demo-icon-box">
                          <Activity size={19} />
                        </span>
                        <div>
                          <strong>
                            {event.action.replaceAll("_", " ")} · {event.entity_kind}
                          </strong>
                          <p>
                            {formatDate(event.created_at)} ·{" "}
                            {event.actor_user_id ? "Authenticated workspace member" : "Demo system"}
                          </p>
                          <Pill tone="purple">Demo · audited</Pill>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Empty
                      title="No activity in this filter"
                      detail="Actions recorded through Yamdy demo workflows appear here."
                    />
                  )}
                </div>
              </Panel>
              <div className="demo-stack">
                <Panel title="Execution timeline">
                  <div className="demo-card-list">
                    {data.executions.length ? (
                      data.executions.map((execution) => (
                        <div className="demo-sample-card" key={execution.id}>
                          <span className="demo-icon-box">
                            <CheckCircle2 size={19} />
                          </span>
                          <div>
                            <strong>Approval simulation recorded</strong>
                            <p>
                              {formatDate(execution.created_at)} · {execution.explanation}
                            </p>
                            <Pill tone="purple">Not confirmed live</Pill>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty
                        title="No executions"
                        detail="A reviewed approval can create a simulated execution record."
                      />
                    )}
                  </div>
                </Panel>
                <Panel title="Technical boundary">
                  <p className="demo-help">
                    There is no retry push action because no HungerStation request was made. Audit
                    export contains only workspace-visible demo events.
                  </p>
                  <Pill tone="green">No production traffic</Pill>
                </Panel>
              </div>
            </div>
          </Screen>
        );
      }}
    </DemoReady>
  );
}

export function SettingsScreen() {
  const { workspace, refresh } = useDemo();
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [fullName, setFullName] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const api = getSupabase();
    if (!api) return;
    void api
      .from("profiles")
      .select("full_name")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setFullName(data.full_name);
        setProfileLoaded(true);
      });
  }, []);
  async function save() {
    const api = getSupabase();
    if (!api) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const user = await api.auth.getUser();
      if (user.error || !user.data.user) throw new Error("Sign in again.");
      const profile = await api
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("user_id", user.data.user.id);
      if (profile.error) throw profile.error;
      if (workspace.role === "owner" && workspaceName.trim() !== workspace.name) {
        const result = await api
          .from("workspaces")
          .update({ name: workspaceName.trim(), updated_at: new Date().toISOString() })
          .eq("id", workspace.id);
        if (result.error) throw result.error;
      }
      await refresh();
      setSuccess("Workspace settings saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <DemoReady>
      {(data) => {
        const connection = data.connections.find((c) => c.provider === "hungerstation");
        return (
          <Screen
            eyebrow="WORKSPACE ADMINISTRATION"
            title="Settings & Workspace Administration"
            subtitle="Manage profile and review demo branch, role and connection boundaries."
            actions={
              <button
                className="primary-button"
                disabled={busy || !profileLoaded}
                onClick={() => void save()}
              >
                Save profile changes
              </button>
            }
          >
            <div className="demo-split">
              <div className="demo-stack">
                <Panel title="Business Profile">
                  <div className="demo-form-grid">
                    <label className="demo-field">
                      Workspace name
                      <input
                        className="demo-input"
                        value={workspaceName}
                        disabled={workspace.role !== "owner"}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                      />
                    </label>
                    <label className="demo-field">
                      Your display name
                      <input
                        className="demo-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                      />
                    </label>
                  </div>
                  <p className="demo-help">
                    Only owners can rename a workspace. Profile names are visible only to the
                    signed-in user in this foundation schema.
                  </p>
                  <ActionFeedback error={error} success={success} />
                </Panel>
                <Panel title="Branches & Outlets">
                  <div className="demo-table-wrap">
                    <table className="demo-table">
                      <thead>
                        <tr>
                          <th>Branch</th>
                          <th>City</th>
                          <th>Timezone</th>
                          <th>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.branches.map((branch) => (
                          <tr key={branch.id}>
                            <td>
                              <strong>{branch.name}</strong>
                              <small>{branch.name_ar}</small>
                            </td>
                            <td>{branch.city}</td>
                            <td>{branch.timezone}</td>
                            <td>
                              <Pill tone="purple">Demo import</Pill>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
                <Panel title="Team Members & Permission Matrix">
                  <div className="demo-table-wrap">
                    <table className="demo-table">
                      <thead>
                        <tr>
                          <th>Member ID</th>
                          <th>Assigned role</th>
                          <th>Branch scope</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.memberships.map((m) => (
                          <tr key={m.id}>
                            <td>
                              <strong>{m.user_id.slice(0, 8)}…</strong>
                            </td>
                            <td>
                              <Pill tone="green">{m.role.replaceAll("_", " ")}</Pill>
                            </td>
                            <td>
                              {m.scope_all_branches
                                ? "All workspace branches"
                                : "Assigned branches only"}
                            </td>
                            <td>{m.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="demo-help">
                    Invitations require a verified email workflow and are not sent in demo mode.
                    Role checks are enforced in database functions and RLS.
                  </p>
                </Panel>
              </div>
              <div className="demo-stack">
                <Panel title="Connected Aggregator Channels">
                  <div className="demo-sample-card">
                    <span className="demo-icon-box">
                      <LockKeyhole size={21} />
                    </span>
                    <div>
                      <strong>HungerStation · {connection?.mode ?? "not set"}</strong>
                      <p>
                        {connection?.status ?? "No connection"} · Mock adapter · No production
                        credentials
                      </p>
                      <Pill tone="purple">Development connection</Pill>
                    </div>
                  </div>
                  <p className="demo-help">
                    API keys and webhook controls remain unavailable until the partner contract and
                    secure server-side flow are ready.
                  </p>
                </Panel>
                <Panel title="Autonomous Boundaries & Human Approval Policies">
                  <div className="demo-card-list">
                    <div className="demo-sample-card">
                      <ShieldCheck size={20} />
                      <div>
                        <strong>Human approval for commercial actions</strong>
                        <p>
                          Owner or general manager review, distinct from requester for financial
                          actions.
                        </p>
                      </div>
                    </div>
                    <div className="demo-sample-card">
                      <Users size={20} />
                      <div>
                        <strong>Branch scope enforced</strong>
                        <p>
                          Membership, role and branch access are checked by RLS and demo functions.
                        </p>
                      </div>
                    </div>
                  </div>
                </Panel>
                <Panel title="Notifications & Billing">
                  <p className="demo-help">
                    Notification delivery and subscription billing are not connected. This workspace
                    is a demo and no payment method is requested.
                  </p>
                  <Pill tone="purple">No charges</Pill>
                </Panel>
              </div>
            </div>
          </Screen>
        );
      }}
    </DemoReady>
  );
}
