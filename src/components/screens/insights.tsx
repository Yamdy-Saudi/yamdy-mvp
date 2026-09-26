import { Link } from "@tanstack/react-router";
import { ArrowRight, BellRing, CheckCircle2, Clock3, Lightbulb, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useDemo } from "../demo-provider";
import {
  ActionFeedback,
  BarChart,
  DemoReady,
  Empty,
  formatDate,
  formatSar,
  Panel,
  Pill,
  Screen,
  Stat,
  useDemoAction,
} from "../demo-ui";
import { updateOpportunity } from "../../lib/demo";

const domainTone = (domain: string) =>
  domain === "operational"
    ? "red"
    : domain === "pricing"
      ? "purple"
      : domain === "marketing"
        ? "orange"
        : "green";
const priorityTone = (priority: string) =>
  priority === "critical" ? "red" : priority === "high" ? "orange" : "neutral";

export function HomeScreen() {
  const { workspace } = useDemo();
  const [filter, setFilter] = useState("All");
  const action = useDemoAction();
  return (
    <DemoReady>
      {(data) => {
        const active = data.opportunities.filter(
          (item) => !["dismissed", "resolved", "simulated"].includes(item.status),
        );
        const visible =
          filter === "All" ? active : active.filter((item) => item.domain === filter.toLowerCase());
        const week = data.performance.filter(
          (item) => new Date(item.day) >= new Date(Date.now() - 7 * 86400000),
        );
        const revenue = week.reduce((sum, item) => sum + Number(item.revenue_sar), 0);
        return (
          <Screen
            eyebrow="OPPORTUNITY-FIRST OPERATIONS"
            title="Good morning"
            subtitle={`${workspace.name} · Review what needs your attention today.`}
            actions={
              <Link className="secondary-button" to="/app/health">
                Restaurant health <ArrowRight size={16} />
              </Link>
            }
          >
            <div className="demo-grid">
              <Stat
                label="Needs attention"
                value={active.length}
                detail="Sample recommendations"
                tone="orange"
              />
              <Stat
                label="Open approvals"
                value={data.approvals.filter((item) => item.status === "pending").length}
                detail="Human review required"
                tone="purple"
              />
              <Stat
                label="Sample 7-day revenue"
                value={formatSar(revenue)}
                detail="Synthetic orders · not channel data"
              />
              <Stat
                label="Imported branches"
                value={data.branches.length}
                detail="Mock HungerStation mapping"
              />
            </div>
            <div className="demo-split">
              <Panel
                title="Needs your attention"
                aside={<span className="demo-help">Observed in demo data</span>}
              >
                <div className="demo-filter-row" style={{ marginBottom: 16 }}>
                  {["All", "Operational", "Pricing", "Marketing", "Promotions"].map((name) => (
                    <button
                      key={name}
                      className={`demo-filter${filter === name ? " is-active" : ""}`}
                      onClick={() => setFilter(name)}
                    >
                      {name} (
                      {name === "All"
                        ? active.length
                        : active.filter((item) => item.domain === name.toLowerCase()).length}
                      )
                    </button>
                  ))}
                </div>
                <ActionFeedback error={action.error} success={action.success} />
                <div className="demo-card-list">
                  {visible.length ? (
                    visible.map((item) => (
                      <article className="demo-opportunity" key={item.id}>
                        <div className="demo-opportunity-top">
                          <Pill tone={priorityTone(item.priority)}>{item.priority}</Pill>
                          <Pill tone={domainTone(item.domain)}>{item.domain}</Pill>
                          <Pill>{item.status.replaceAll("_", " ")}</Pill>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <div className="demo-opportunity-footer">
                          <div className="demo-opportunity-meta">
                            <small>
                              {data.branches.find((b) => b.id === item.branch_id)?.name ??
                                "All branches"}
                            </small>
                            <small>· {formatDate(item.observed_at)}</small>
                            <small>· Estimated {formatSar(item.estimated_impact_sar)}</small>
                          </div>
                          <div className="demo-actions">
                            {item.domain === "operational" && (
                              <button
                                className="secondary-button"
                                disabled={action.busy}
                                onClick={() =>
                                  void action.run(
                                    () => updateOpportunity(item.id, "resolve"),
                                    "Sample availability restored internally.",
                                  )
                                }
                              >
                                Resolve sample issue
                              </button>
                            )}
                            <Link
                              className="primary-button"
                              to="/app/opportunities/$id"
                              params={{ id: item.id }}
                            >
                              Review <ArrowRight size={15} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <Empty
                      title="No matching opportunities"
                      detail="Choose another filter or review the full inbox."
                    />
                  )}
                </div>
              </Panel>
              <div className="demo-stack">
                <Panel title="Operations pulse">
                  <div className="demo-kv">
                    <div>
                      <small>Sample branch health</small>
                      <strong>83 / 100</strong>
                    </div>
                    <div>
                      <small>Catalog quality</small>
                      <strong>79 / 100</strong>
                    </div>
                    <div>
                      <small>Demo products</small>
                      <strong>{data.products.length}</strong>
                    </div>
                    <div>
                      <small>Mock connections</small>
                      <strong>{data.connections.length}</strong>
                    </div>
                  </div>
                  <p className="demo-help">
                    Scores summarize synthetic fixture conditions and are not HungerStation
                    measurements.
                  </p>
                  <Link className="text-link" to="/app/health">
                    Inspect health <ArrowRight size={15} />
                  </Link>
                </Panel>
                <Panel title="Recently simulated">
                  <div className="demo-card-list">
                    {data.executions.length ? (
                      data.executions.slice(0, 3).map((execution) => (
                        <div className="demo-sample-card" key={execution.id}>
                          <span className="demo-icon-box">
                            <CheckCircle2 size={20} />
                          </span>
                          <div>
                            <strong>Approved demo action</strong>
                            <p>{execution.explanation}</p>
                            <Pill tone="purple">Not confirmed live</Pill>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty
                        title="No demo executions yet"
                        detail="Review a sample approval to see the audit trail and simulated result."
                      />
                    )}
                  </div>
                  <Link className="text-link" to="/app/activity">
                    View activity <ArrowRight size={15} />
                  </Link>
                </Panel>
              </div>
            </div>
          </Screen>
        );
      }}
    </DemoReady>
  );
}

export function OpportunitiesScreen() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  return (
    <DemoReady>
      {(data) => {
        const rows = data.opportunities.filter(
          (item) =>
            (filter === "all" || item.domain === filter) &&
            `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
        );
        return (
          <Screen
            eyebrow="RECOMMENDATION INBOX"
            title="Opportunities"
            subtitle="Prioritized demo observations with source, scope and confidence."
          >
            <div className="demo-grid demo-grid--three">
              <Stat label="Total sample insights" value={data.opportunities.length} />
              <Stat
                label="High or critical"
                value={
                  data.opportunities.filter((item) => ["high", "critical"].includes(item.priority))
                    .length
                }
                tone="orange"
              />
              <Stat
                label="In human review"
                value={data.opportunities.filter((item) => item.status === "in_review").length}
                tone="purple"
              />
            </div>
            <Panel title="All opportunities">
              <div className="demo-filter-row" style={{ marginBottom: 15 }}>
                {["all", "operational", "pricing", "marketing", "promotions", "listings"].map(
                  (name) => (
                    <button
                      key={name}
                      className={`demo-filter${filter === name ? " is-active" : ""}`}
                      onClick={() => setFilter(name)}
                    >
                      {name}
                    </button>
                  ),
                )}
                <input
                  className="demo-search"
                  aria-label="Search opportunities"
                  placeholder="Search opportunities"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="demo-table-wrap">
                <table className="demo-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Recommendation</th>
                      <th>Domain</th>
                      <th>Branch</th>
                      <th>Estimated impact</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Pill tone={priorityTone(item.priority)}>{item.priority}</Pill>
                        </td>
                        <td>
                          <strong>{item.title}</strong>
                          <small>{item.description.slice(0, 76)}…</small>
                        </td>
                        <td>
                          <Pill tone={domainTone(item.domain)}>{item.domain}</Pill>
                        </td>
                        <td>
                          {data.branches.find((b) => b.id === item.branch_id)?.name ??
                            "All branches"}
                        </td>
                        <td>{formatSar(item.estimated_impact_sar)}</td>
                        <td>Demo · {formatDate(item.observed_at)}</td>
                        <td>
                          <Pill>{item.status.replaceAll("_", " ")}</Pill>
                        </td>
                        <td>
                          <Link to="/app/opportunities/$id" params={{ id: item.id }}>
                            Review →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!rows.length && (
                  <Empty
                    title="No matching insights"
                    detail="Try a different search or domain filter."
                  />
                )}
              </div>
            </Panel>
          </Screen>
        );
      }}
    </DemoReady>
  );
}

export function OpportunityDetailScreen({ id }: { id: string }) {
  const action = useDemoAction();
  return (
    <DemoReady>
      {(data) => {
        const item = data.opportunities.find((value) => value.id === id);
        if (!item)
          return (
            <Empty
              title="Opportunity not found"
              detail="It may belong to another workspace or branch."
            />
          );
        const branch = data.branches.find((value) => value.id === item.branch_id);
        const product = data.products.find((value) => value.id === item.product_id);
        const approval = data.approvals.find((value) => value.opportunity_id === item.id);
        const evidence =
          item.evidence && typeof item.evidence === "object" && !Array.isArray(item.evidence)
            ? item.evidence
            : {};
        return (
          <Screen
            eyebrow="RECOMMENDATION DETAIL"
            title={item.title}
            subtitle={`${branch?.name ?? "All branches"} · Observed ${formatDate(item.observed_at)} · Demo source`}
            actions={
              <Link className="secondary-button" to="/app/opportunities">
                Back to inbox
              </Link>
            }
          >
            <div className="demo-grid demo-grid--three">
              <Stat
                label="Estimated impact"
                value={formatSar(item.estimated_impact_sar)}
                detail="Illustrative forecast only"
              />
              <Stat
                label="Confidence"
                value={`${item.confidence ?? 0}%`}
                detail="Demo model estimate"
                tone="purple"
              />
              <Stat
                label="Review status"
                value={item.status.replaceAll("_", " ")}
                detail="External state not confirmed"
                tone="orange"
              />
            </div>
            <div className="demo-split">
              <div className="demo-stack">
                <Panel title="Why Yamdy recommends this">
                  <p>{item.description}</p>
                  <div className="demo-kv">
                    <div>
                      <small>Domain</small>
                      <strong>{item.domain}</strong>
                    </div>
                    <div>
                      <small>Product</small>
                      <strong>{product?.name_en ?? "Business level"}</strong>
                    </div>
                    <div>
                      <small>Sample source</small>
                      <strong>{String(evidence["source"] ?? "Demo fixture")}</strong>
                    </div>
                    <div>
                      <small>Observation age</small>
                      <strong>{formatDate(item.observed_at)}</strong>
                    </div>
                  </div>
                  <p className="demo-help">
                    This explanation is derived from synthetic fixture data. It is not a live
                    channel observation.
                  </p>
                </Panel>
                <Panel title="Illustrative outcome simulation">
                  <BarChart
                    values={[36, 39, 42, 40, 38, 39, 37]}
                    labels={["P10", "P25", "P50", "P75", "P90", "Now", "Test"]}
                  />
                  <p className="demo-help">
                    Sample distribution only. No competitor feed, elasticity model or causal result
                    has been connected.
                  </p>
                </Panel>
                <Panel title="Engine audit trail">
                  <div className="demo-sample-card">
                    <Clock3 size={19} />
                    <div>
                      <strong>Sample observation created</strong>
                      <p>
                        {formatDate(item.observed_at)} · Demo fixture · Workspace scope verified by
                        RLS
                      </p>
                    </div>
                  </div>
                  {approval && (
                    <div className="demo-sample-card" style={{ marginTop: 9 }}>
                      <BellRing size={19} />
                      <div>
                        <strong>Human review {approval.status}</strong>
                        <p>
                          {approval.status === "approved"
                            ? "Simulation recorded; no live publish."
                            : "Approval and execution remain separate."}
                        </p>
                      </div>
                    </div>
                  )}
                </Panel>
              </div>
              <div className="demo-stack">
                <Panel title="Execution parameters">
                  <div className="demo-kv">
                    <div>
                      <small>Branch</small>
                      <strong>{branch?.name ?? "All"}</strong>
                    </div>
                    <div>
                      <small>Current sample price</small>
                      <strong>{product ? formatSar(product.price_sar) : "—"}</strong>
                    </div>
                    <div>
                      <small>Recommended test</small>
                      <strong>
                        {item.domain === "pricing" ? "SAR 39 · 7 days" : "Internal demo"}
                      </strong>
                    </div>
                    <div>
                      <small>Channel</small>
                      <strong>Mock only</strong>
                    </div>
                  </div>
                </Panel>
                <Panel title="Guardrails & safety">
                  <ul className="demo-help">
                    <li>Human approval required for commercial changes.</li>
                    <li>Financial requester cannot approve their own request.</li>
                    <li>No API call or customer-visible publication occurs.</li>
                    <li>External confirmation remains “not confirmed”.</li>
                  </ul>
                  <ActionFeedback error={action.error} success={action.success} />
                  <div className="demo-actions">
                    {!approval && item.status === "recommended" && (
                      <button
                        className="primary-button"
                        disabled={action.busy}
                        onClick={() =>
                          void action.run(
                            () => updateOpportunity(item.id, "request"),
                            "Sent to the demo approval queue.",
                          )
                        }
                      >
                        Request review
                      </button>
                    )}
                    {approval && (
                      <Link className="primary-button" to="/app/approvals">
                        View approval →
                      </Link>
                    )}
                    {item.status === "recommended" && (
                      <button
                        className="secondary-button"
                        disabled={action.busy}
                        onClick={() =>
                          void action.run(
                            () => updateOpportunity(item.id, "dismiss"),
                            "Sample opportunity dismissed.",
                          )
                        }
                      >
                        Dismiss
                      </button>
                    )}
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

export function HealthScreen() {
  const [branchId, setBranchId] = useState("all");
  return (
    <DemoReady>
      {(data) => {
        const issues = data.opportunities.filter(
          (item) =>
            !["dismissed", "resolved", "simulated"].includes(item.status) &&
            (branchId === "all" || item.branch_id === branchId),
        );
        return (
          <Screen
            eyebrow="OPERATIONS DIAGNOSTIC"
            title="Restaurant Health"
            subtitle="Sample signals across your imported demo branches."
            actions={
              <select
                aria-label="Select branch"
                className="demo-select"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                <option value="all">All branches ({data.branches.length})</option>
                {data.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            }
          >
            <div className="demo-grid">
              <Stat label="Overall demo health" value="83 / 100" detail="Synthetic diagnostic" />
              <Stat
                label="Operational issues"
                value={issues.filter((i) => i.domain === "operational").length}
                tone="orange"
              />
              <Stat
                label="Listing quality"
                value={`${Math.round(data.products.reduce((n, p) => n + p.listing_quality, 0) / Math.max(data.products.length, 1))}%`}
              />
              <Stat label="Unconfirmed executions" value={data.executions.length} tone="purple" />
            </div>
            <div className="demo-grid demo-grid--three">
              <Panel title="Availability">
                <p className="demo-help">Sample product availability across branch mappings.</p>
                <strong>
                  {data.productStates.filter((s) => s.is_available).length} /{" "}
                  {data.productStates.length} available
                </strong>
                <div className="demo-progress">
                  <span
                    style={{
                      width: `${(100 * data.productStates.filter((s) => s.is_available).length) / Math.max(data.productStates.length, 1)}%`,
                    }}
                  />
                </div>
              </Panel>
              <Panel title="Commercial opportunity">
                <p className="demo-help">
                  Pricing, promotion and marketing issues in the sample data.
                </p>
                <strong>{issues.filter((i) => i.domain !== "operational").length} active</strong>
              </Panel>
              <Panel title="Channel status">
                <p className="demo-help">
                  Mock connection provides no live freshness or sync claim.
                </p>
                <Pill tone="purple">Development mode</Pill>
              </Panel>
            </div>
            <Panel title="Priority Issues & Action Queue">
              <div className="demo-table-wrap">
                <table className="demo-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Domain</th>
                      <th>Issue description</th>
                      <th>Branch</th>
                      <th>Estimated impact</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Pill tone={priorityTone(item.priority)}>{item.priority}</Pill>
                        </td>
                        <td>{item.domain}</td>
                        <td>
                          <strong>{item.title}</strong>
                        </td>
                        <td>{data.branches.find((b) => b.id === item.branch_id)?.name}</td>
                        <td>{formatSar(item.estimated_impact_sar)}</td>
                        <td>{item.status.replaceAll("_", " ")}</td>
                        <td>
                          <Link to="/app/opportunities/$id" params={{ id: item.id }}>
                            Review →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!issues.length && (
                  <Empty
                    title="No open sample issues"
                    detail="All matching demo issues have been reviewed."
                  />
                )}
              </div>
            </Panel>
          </Screen>
        );
      }}
    </DemoReady>
  );
}

export function PricingScreen() {
  const [query, setQuery] = useState("");
  return (
    <DemoReady>
      {(data) => {
        const products = data.products.filter((p) =>
          p.name_en.toLowerCase().includes(query.toLowerCase()),
        );
        const pricing = data.opportunities.find((item) => item.domain === "pricing");
        return (
          <Screen
            eyebrow="COMMERCIAL INTELLIGENCE"
            title="Pricing Intelligence"
            subtitle="Internal pricing exploration with synthetic comparisons and transparent assumptions."
            actions={
              <Link className="secondary-button" to="/app/performance">
                View experiments <ArrowRight size={15} />
              </Link>
            }
          >
            {pricing && (
              <Panel
                title="Featured price opportunity"
                aside={<Pill tone="purple">Demo estimate</Pill>}
              >
                <div className="demo-split">
                  <div>
                    <h3>{pricing.title}</h3>
                    <p>{pricing.description}</p>
                    <div className="demo-actions">
                      <Link
                        className="primary-button"
                        to="/app/opportunities/$id"
                        params={{ id: pricing.id }}
                      >
                        Review full economic model <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                  <div className="demo-kv">
                    <div>
                      <small>Current sample</small>
                      <strong>SAR 42</strong>
                    </div>
                    <div>
                      <small>Proposed test</small>
                      <strong>SAR 39</strong>
                    </div>
                    <div>
                      <small>Estimated impact</small>
                      <strong>{formatSar(pricing.estimated_impact_sar)}</strong>
                    </div>
                    <div>
                      <small>Confidence</small>
                      <strong>{pricing.confidence}%</strong>
                    </div>
                  </div>
                </div>
              </Panel>
            )}
            <div className="demo-split">
              <Panel title="Sample price range by SKU">
                <BarChart
                  values={data.products.map((p) => Number(p.price_sar))}
                  labels={data.products.map((p) => p.sku.replace("DEMO-", ""))}
                />
                <p className="demo-help">
                  This compares products within the synthetic menu. No market quartile feed is
                  connected.
                </p>
              </Panel>
              <Panel title="Pricing guardrails">
                <div className="demo-card-list">
                  <div className="demo-sample-card">
                    <Lightbulb size={20} />
                    <div>
                      <strong>Human review first</strong>
                      <p>Any suggested price test becomes an internal approval request.</p>
                    </div>
                  </div>
                  <div className="demo-sample-card">
                    <TrendingUp size={20} />
                    <div>
                      <strong>Predictions are estimates</strong>
                      <p>Real margins, elasticity and competitor evidence are not available.</p>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
            <Panel
              title="SKU Price Matrix"
              aside={
                <input
                  className="demo-search"
                  placeholder="Search products"
                  aria-label="Search price matrix"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              }
            >
              <div className="demo-table-wrap">
                <table className="demo-table">
                  <thead>
                    <tr>
                      <th>Product & SKU</th>
                      <th>Current sample price</th>
                      <th>Cost assumption</th>
                      <th>Margin estimate</th>
                      <th>Recommendation</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name_en}</strong>
                          <small>{p.sku}</small>
                        </td>
                        <td>{formatSar(p.price_sar)}</td>
                        <td>{formatSar(p.cost_sar)}</td>
                        <td>
                          {p.cost_sar
                            ? `${Math.round((100 * (Number(p.price_sar) - Number(p.cost_sar))) / Number(p.price_sar))}%`
                            : "Unknown"}
                        </td>
                        <td>{p.sku === "DEMO-BURGER" ? "Test SAR 39" : "Hold sample price"}</td>
                        <td>
                          <Pill tone="purple">Internal only</Pill>
                        </td>
                        <td>
                          <Link to="/app/listings/$id" params={{ id: p.id }}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </Screen>
        );
      }}
    </DemoReady>
  );
}

export function PerformanceScreen() {
  const [view, setView] = useState("14 days");
  return (
    <DemoReady>
      {(data) => {
        const days = view === "14 days" ? 14 : 28;
        const recent = data.performance.filter(
          (row) => new Date(row.day) >= new Date(Date.now() - (days - 1) * 86400000),
        );
        const totals = new Map<string, number>();
        for (const row of recent)
          totals.set(row.day, (totals.get(row.day) ?? 0) + Number(row.revenue_sar));
        const series = [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
        const orders = recent.reduce((n, row) => n + row.orders, 0);
        const revenue = recent.reduce((n, row) => n + Number(row.revenue_sar), 0);
        const spend = recent.reduce((n, row) => n + Number(row.ad_spend_sar), 0);
        return (
          <Screen
            eyebrow="MEASURE & LEARN"
            title="Performance & Experiments"
            subtitle="Synthetic daily performance and clearly separated demo interventions."
            actions={
              <select
                className="demo-select"
                aria-label="Performance range"
                value={view}
                onChange={(e) => setView(e.target.value)}
              >
                <option>14 days</option>
                <option>28 days</option>
              </select>
            }
          >
            <div className="demo-grid">
              <Stat
                label="Sample revenue"
                value={formatSar(revenue)}
                detail={`${days}-day synthetic total`}
              />
              <Stat label="Sample orders" value={orders} />
              <Stat label="Sample ad spend" value={formatSar(spend)} tone="purple" />
              <Stat
                label="Observed impact"
                value="Unverified"
                detail="No causal experiment data"
                tone="orange"
              />
            </div>
            <Panel
              title="Revenue & Order Velocity with Yamdy Intervention Milestones"
              aside={<Pill tone="purple">Synthetic series</Pill>}
            >
              <BarChart
                values={series.map(([, v]) => v)}
                labels={series.map(([date]) => date.slice(5))}
              />
              <p className="demo-help">
                The series is generated from demo fixtures. Approval or simulated execution is not a
                measured sales lift.
              </p>
            </Panel>
            <div className="demo-split">
              <Panel title="Yamdy Experiments & Interventions">
                <div className="demo-table-wrap">
                  <table className="demo-table">
                    <thead>
                      <tr>
                        <th>Intervention</th>
                        <th>Domain</th>
                        <th>Branch scope</th>
                        <th>Baseline</th>
                        <th>Test</th>
                        <th>Measured impact</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.opportunities
                        .filter((i) => ["pricing", "operational", "marketing"].includes(i.domain))
                        .map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.title}</strong>
                            </td>
                            <td>{item.domain}</td>
                            <td>{data.branches.find((b) => b.id === item.branch_id)?.name}</td>
                            <td>Sample only</td>
                            <td>Proposed</td>
                            <td>Not measured</td>
                            <td>
                              <Pill tone={item.status === "simulated" ? "purple" : "orange"}>
                                {item.status}
                              </Pill>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel title="What Yamdy Learned">
                <div className="demo-sample-card">
                  <span className="demo-icon-box">
                    <Lightbulb size={20} />
                  </span>
                  <div>
                    <strong>Institutional knowledge needs observed outcomes</strong>
                    <p>
                      Once a valid baseline and test period are available, this panel can compare
                      them with confounders.
                    </p>
                  </div>
                </div>
                <p className="demo-help">
                  No permanent price adoption or branch rollout is offered in demo mode.
                </p>
              </Panel>
            </div>
          </Screen>
        );
      }}
    </DemoReady>
  );
}
