import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgePercent,
  Megaphone,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useDemo } from "../demo-provider";
import {
  AcloConceptBanner,
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
import { saveDemoDraft } from "../../lib/demo";

export function PromotionsScreen() {
  const { workspace } = useDemo();
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("Explore breakfast add-ons");
  const [discount, setDiscount] = useState("15");
  const [branchId, setBranchId] = useState("all");
  const action = useDemoAction();
  return (
    <DemoReady>
      {(data) => {
        const drafts = data.drafts.filter((d) => d.kind === "promotion");
        const opps = data.opportunities.filter(
          (o) => o.domain === "promotions" && o.status !== "dismissed",
        );
        return (
          <Screen
            eyebrow="INTERNAL COMMERCIAL STUDIO"
            title="Promotions & Offers"
            subtitle="Explore sample demand opportunities and prepare internal promotion drafts."
            actions={<span className="demo-label">CHANNEL PUBLISH UNAVAILABLE</span>}
          >
            {workspace.name.startsWith("Aclo") && (
              <AcloConceptBanner
                label="PROMOTION CONCEPT · DRAFT ONLY"
                imagePath="/aclo-demo/promotion.png"
                headline="Make the morning a little brighter."
                description="An illustrative box and peach tea pairing for an internal offer draft."
              />
            )}
            <div className="demo-grid demo-grid--three">
              <Stat label="Sample promotions" value={drafts.length} />
              <Stat label="Demo opportunities" value={opps.length} tone="purple" />
              <Stat
                label="Live channel promotions"
                value="Unverified"
                detail="Partner entitlement pending"
                tone="orange"
              />
            </div>
            <div className="demo-split">
              <Panel
                title="AI Promotion Opportunities"
                aside={<Pill tone="purple">Demo rules</Pill>}
              >
                <div className="demo-card-list">
                  {opps.length ? (
                    opps.map((opp) => (
                      <div className="demo-opportunity" key={opp.id}>
                        <div className="demo-opportunity-top">
                          <Pill tone="orange">{opp.priority}</Pill>
                          <Pill>{opp.status}</Pill>
                        </div>
                        <h3>{opp.title}</h3>
                        <p>{opp.description}</p>
                        <div className="demo-opportunity-footer">
                          <small>
                            Impact{" "}
                            {opp.estimated_impact_sar == null
                              ? "not measured"
                              : `${formatSar(opp.estimated_impact_sar)} · synthetic`}
                          </small>
                          <Link
                            className="text-link"
                            to="/app/opportunities/$id"
                            params={{ id: opp.id }}
                          >
                            Review opportunity →
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Empty
                      title="No open promotion suggestions"
                      detail="Your sample queue is clear."
                    />
                  )}
                </div>
              </Panel>
              <Panel title="Promotion Builder">
                <p className="demo-help">
                  The Stitch studio’s objectives are available as internal drafts. Discount
                  publication is not enabled.
                </p>
                <div className="demo-form">
                  <label className="demo-field">
                    Promotion name
                    <input
                      className="demo-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Morning Box + Peach Tea"
                    />
                  </label>
                  <label className="demo-field">
                    Business objective
                    <select
                      className="demo-select"
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                    >
                      <option>Explore breakfast add-ons</option>
                      <option>Increase basket value</option>
                      <option>Acquire new customers</option>
                      <option>Defend conversion</option>
                    </select>
                  </label>
                  <div className="demo-form-grid">
                    <label className="demo-field">
                      Illustrative discount (%)
                      <input
                        className="demo-input"
                        type="number"
                        min="1"
                        max="70"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                    </label>
                    <label className="demo-field">
                      Branch scope
                      <select
                        className="demo-select"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                      >
                        <option value="all">Illustrative scope only</option>
                        {data.branches
                          .filter((b) => b.is_demo && !b.archived_at)
                          .map((b) => (
                            <option value={b.id} key={b.id}>
                              {b.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                  <ActionFeedback error={action.error} success={action.success} />
                  <button
                    className="primary-button"
                    disabled={
                      action.busy ||
                      title.trim().length < 3 ||
                      Number(discount) < 1 ||
                      Number(discount) > 70
                    }
                    onClick={() => {
                      void action.run(
                        () =>
                          saveDemoDraft(workspace.id, "promotion", title, {
                            objective,
                            discount_percent: Number(discount),
                            branch_id: branchId,
                            source: "demo",
                            channel_request_sent: false,
                          }),
                        "Internal promotion draft saved. No channel publish occurred.",
                      );
                    }}
                  >
                    Save internal promotion draft
                  </button>
                </div>
              </Panel>
            </div>
            <Panel
              title="Active & Scheduled Promotions"
              aside={<Pill tone="purple">Internal samples</Pill>}
            >
              <div className="demo-table-wrap">
                <table className="demo-table">
                  <thead>
                    <tr>
                      <th>Promotion & objective</th>
                      <th>Discount mechanic</th>
                      <th>Branch scope</th>
                      <th>Schedule</th>
                      <th>Orders</th>
                      <th>Gross revenue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drafts.map((draft) => {
                      const p =
                        draft.payload &&
                        typeof draft.payload === "object" &&
                        !Array.isArray(draft.payload)
                          ? draft.payload
                          : {};
                      return (
                        <tr key={draft.id}>
                          <td>
                            <strong>{draft.title}</strong>
                            <small>{String(p["objective"] ?? "Sample offer")}</small>
                          </td>
                          <td>
                            {p["discount_percent"]
                              ? `${p["discount_percent"]}% internal proposal`
                              : String(p["discount"] ?? "Internal sample")}
                          </td>
                          <td>
                            {p["branch_id"]
                              ? (data.branches.find((b) => b.id === p["branch_id"])?.name ??
                                "All branches")
                              : "All demo branches"}
                          </td>
                          <td>Not scheduled externally</td>
                          <td>—</td>
                          <td>—</td>
                          <td>
                            <Pill tone="purple">{draft.status}</Pill>
                          </td>
                        </tr>
                      );
                    })}
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

export function BundlesScreen() {
  const { workspace } = useDemo();
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [price, setPrice] = useState("129");
  const action = useDemoAction();
  return (
    <DemoReady>
      {(data) => {
        const drafts = data.drafts.filter((d) => d.kind === "bundle");
        const selectedProducts = data.products.filter((p) => selected.includes(p.id));
        const individual = selectedProducts.reduce((n, p) => n + Number(p.price_sar), 0);
        return (
          <Screen
            eyebrow="INTERNAL MERCHANDISING"
            title="Bundle Builder & Combos"
            subtitle="Design a meal deal in Yamdy. Mixed-item bundle publication is unverified."
            actions={<span className="demo-label">DRAFT ONLY</span>}
          >
            <div className="demo-grid demo-grid--three">
              <Stat label="Sample bundles" value={drafts.length} />
              <Stat label="Selected items" value={selected.length} tone="purple" />
              <Stat
                label="Illustrative value"
                value={formatSar(individual - Number(price))}
                detail="Difference vs individual sample prices"
                tone="orange"
              />
            </div>
            <div className="demo-split">
              <div className="demo-stack">
                <Panel title="Bundle Identity & Catalog Placement">
                  <label className="demo-field">
                    Bundle name
                    <input
                      className="demo-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Office Breakfast Sharing Set"
                    />
                  </label>
                  <p className="demo-help">
                    The name is an internal draft; it is not added to HungerStation’s catalog.
                  </p>
                </Panel>
                <Panel title="Bundle Composition & Portions">
                  <div className="demo-card-list">
                    {data.products.map((product) => (
                      <label
                        key={product.id}
                        className="demo-sample-card"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(product.id)}
                          onChange={(e) =>
                            setSelected((current) =>
                              e.target.checked
                                ? [...current, product.id]
                                : current.filter((id) => id !== product.id),
                            )
                          }
                        />
                        {product.image_path ? (
                          <img
                            className="demo-mini-product-image"
                            src={product.image_path}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <span className="demo-icon-box">
                            <Package size={18} />
                          </span>
                        )}
                        <div>
                          <strong>{product.name_en}</strong>
                          <p>
                            {formatSar(product.price_sar)} · {product.category}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </Panel>
              </div>
              <div className="demo-stack">
                <Panel title="Commercial Pricing & Value Proposition">
                  <div className="demo-kv">
                    <div>
                      <small>Individual total</small>
                      <strong>{formatSar(individual)}</strong>
                    </div>
                    <div>
                      <small>Draft bundle</small>
                      <strong>{formatSar(price)}</strong>
                    </div>
                  </div>
                  <div className="demo-divider" />
                  <label className="demo-field">
                    Bundle draft price (SAR)
                    <input
                      className="demo-input"
                      type="number"
                      min="0"
                      step="0.5"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </label>
                  <p className="demo-help">
                    Savings are arithmetic on synthetic menu prices, not a forecast of demand or
                    margin.
                  </p>
                </Panel>
                <Panel title="Branch Availability & Serving Schedule">
                  <p className="demo-help">
                    This sample bundle is not mapped to the client's real branch. Live schedule
                    publishing is disabled.
                  </p>
                  <Pill tone="purple">Mock channel</Pill>
                </Panel>
                <Panel title="Save bundle draft">
                  <ActionFeedback error={action.error} success={action.success} />
                  <button
                    className="primary-button"
                    disabled={
                      action.busy ||
                      title.trim().length < 3 ||
                      selected.length < 2 ||
                      Number(price) < 0
                    }
                    onClick={() =>
                      void action.run(
                        () =>
                          saveDemoDraft(workspace.id, "bundle", title, {
                            product_ids: selected,
                            item_names: selectedProducts.map((p) => p.name_en),
                            price_sar: Number(price),
                            source: "demo",
                            channel_request_sent: false,
                          }),
                        "Bundle draft saved internally.",
                      )
                    }
                  >
                    Save as Draft
                  </button>
                </Panel>
              </div>
            </div>
            <Panel
              title="Existing Active Bundles & Meal Deals"
              aside={<Pill tone="purple">Sample drafts only</Pill>}
            >
              <div className="demo-table-wrap">
                <table className="demo-table">
                  <thead>
                    <tr>
                      <th>Bundle name</th>
                      <th>Included items</th>
                      <th>Bundle price</th>
                      <th>30-day orders</th>
                      <th>Gross revenue</th>
                      <th>Channel status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drafts.map((draft) => {
                      const p =
                        draft.payload &&
                        typeof draft.payload === "object" &&
                        !Array.isArray(draft.payload)
                          ? draft.payload
                          : {};
                      return (
                        <tr key={draft.id}>
                          <td>
                            <strong>{draft.title}</strong>
                          </td>
                          <td>
                            {Array.isArray(p["item_names"])
                              ? p["item_names"].join(", ")
                              : Array.isArray(p["items"])
                                ? p["items"].join(", ")
                                : "Draft items"}
                          </td>
                          <td>{formatSar(Number(p["price_sar"] ?? 0))}</td>
                          <td>Not measured</td>
                          <td>Not measured</td>
                          <td>
                            <Pill tone="purple">{draft.status} · internal</Pill>
                          </td>
                        </tr>
                      );
                    })}
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

export function MarketingScreen() {
  const { workspace } = useDemo();
  const [tab, setTab] = useState("campaigns");
  return (
    <DemoReady>
      {(data) => {
        const campaigns = data.drafts.filter((d) => d.kind === "campaign");
        const sampleSpend = data.performance.reduce((n, p) => n + Number(p.ad_spend_sar), 0);
        const sampleRevenue = data.performance.reduce((n, p) => n + Number(p.revenue_sar), 0);
        const clientMode = workspace.reportingMode === "client_export";
        const marketOpp = data.opportunities.filter(
          (o) => o.domain === "marketing" && o.status !== "dismissed",
        );
        return (
          <Screen
            eyebrow="MARKETING EXPLORATION"
            title="Marketing"
            subtitle="Campaign concepts and performance fixtures. Advertising APIs and attribution are not connected."
            actions={
              <Link className="primary-button" to="/app/marketing/new">
                Create internal campaign <ArrowRight size={16} />
              </Link>
            }
          >
            {workspace.name.startsWith("Aclo") && (
              <AcloConceptBanner
                label="MARKETING CREATIVE · INTERNAL BRIEF"
                imagePath="/aclo-demo/marketing.png"
                headline="Bring breakfast to the team."
                description="A sample office sharing story with mini sandwiches, coffee and cake."
              />
            )}
            <div className="demo-grid">
              <Stat
                label={clientMode ? "Ad spend" : "Sample spend"}
                value={clientMode ? "Unknown" : formatSar(sampleSpend)}
                detail={clientMode ? "Not in order export" : "Synthetic 28-day series"}
                tone="purple"
              />
              <Stat
                label={clientMode ? "Historical gross sales" : "Sample revenue"}
                value={
                  clientMode
                    ? formatSar(
                        data.orderPerformance.reduce((n, p) => n + Number(p.gross_sales_sar), 0),
                      )
                    : formatSar(sampleRevenue)
                }
                detail={
                  clientMode
                    ? "Delivered subtotal · Jan–Sep 2026 · not ad-attributed"
                    : "Not ad-attributed"
                }
              />
              <Stat
                label="ROAS"
                value="Unavailable"
                detail="Attribution not connected"
                tone="orange"
              />
              <Stat label="Internal campaigns" value={campaigns.length} />
            </div>
            <Panel
              title="AI Marketing Intelligence"
              aside={<Pill tone="purple">Demo suggestions</Pill>}
            >
              <div className="demo-card-list">
                {marketOpp.map((opp) => (
                  <div className="demo-opportunity" key={opp.id}>
                    <div className="demo-opportunity-top">
                      <Pill tone="orange">{opp.priority}</Pill>
                      <Pill>Sample observation</Pill>
                    </div>
                    <h3>{opp.title}</h3>
                    <p>{opp.description}</p>
                    <div className="demo-opportunity-footer">
                      <small>
                        Impact{" "}
                        {opp.estimated_impact_sar == null
                          ? "not measured"
                          : `${formatSar(opp.estimated_impact_sar)} · illustrative`}
                      </small>
                      <Link className="text-link" to="/app/marketing/new">
                        Review & build campaign →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <div className="demo-split">
              <Panel
                title={
                  clientMode
                    ? "Recent observed gross sales"
                    : "Daily Sample Spend vs. Business Revenue"
                }
              >
                <BarChart
                  values={
                    clientMode
                      ? data.orderPerformance.slice(-14).map((p) => Number(p.gross_sales_sar))
                      : data.performance.slice(-14).map((p) => Number(p.revenue_sar))
                  }
                  labels={
                    clientMode
                      ? data.orderPerformance.slice(-14).map((p) => p.day.slice(5))
                      : data.performance.slice(-14).map((p) => p.day.slice(5))
                  }
                />
                <p className="demo-help">
                  {clientMode
                    ? "Observed dates only; dates without records are unknown. Sales are not attributed to ads."
                    : "Revenue is business-level fixture data. It is not attributed to ads."}
                </p>
              </Panel>
              <Panel title="Recommended by Yamdy">
                <div className="demo-card-list">
                  <div className="demo-sample-card">
                    <span className="demo-icon-box">
                      <Megaphone size={19} />
                    </span>
                    <div>
                      <strong>
                        {clientMode ? "Explore breakfast box story" : "Explore lunch campaign"}
                      </strong>
                      <p>
                        {clientMode
                          ? "Build an internal brief around office morning orders."
                          : "Build an internal brief for stronger lunch visibility."}
                      </p>
                      <Link className="text-link" to="/app/marketing/new">
                        Build campaign →
                      </Link>
                    </div>
                  </div>
                  <div className="demo-sample-card">
                    <span className="demo-icon-box">
                      <TrendingUp size={19} />
                    </span>
                    <div>
                      <strong>Review bid assumptions</strong>
                      <p>Sample bid matrix only; no sponsored search API.</p>
                      <Link className="text-link" to="/app/marketing/bids">
                        Search & bidding →
                      </Link>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
            <Panel
              title="Campaigns"
              aside={
                <div className="demo-filter-row">
                  <button
                    className={`demo-filter${tab === "campaigns" ? " is-active" : ""}`}
                    onClick={() => setTab("campaigns")}
                  >
                    Campaigns
                  </button>
                  <button
                    className={`demo-filter${tab === "bids" ? " is-active" : ""}`}
                    onClick={() => setTab("bids")}
                  >
                    Bid plans
                  </button>
                </div>
              }
            >
              {tab === "campaigns" ? (
                <div className="demo-table-wrap">
                  <table className="demo-table">
                    <thead>
                      <tr>
                        <th>Campaign name & objective</th>
                        <th>Branch scope</th>
                        <th>Budget</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                        <th>ROAS</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((draft) => {
                        const p =
                          draft.payload &&
                          typeof draft.payload === "object" &&
                          !Array.isArray(draft.payload)
                            ? draft.payload
                            : {};
                        return (
                          <tr key={draft.id}>
                            <td>
                              <strong>{draft.title}</strong>
                              <small>{String(p["objective"] ?? "Internal brief")}</small>
                            </td>
                            <td>Demo branches</td>
                            <td>{formatSar(Number(p["budget_sar"] ?? 0))}</td>
                            <td>—</td>
                            <td>—</td>
                            <td>Not attributed</td>
                            <td>
                              <Pill tone="purple">{draft.status}</Pill>
                            </td>
                            <td>
                              <Link to="/app/marketing/new">New brief →</Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="demo-sample-card">
                  <Sparkles size={20} />
                  <div>
                    <strong>Bid plans are internal simulations</strong>
                    <p>Open the bid matrix to review assumptions and save a draft.</p>
                    <Link className="text-link" to="/app/marketing/bids">
                      Open bid matrix →
                    </Link>
                  </div>
                </div>
              )}
            </Panel>
          </Screen>
        );
      }}
    </DemoReady>
  );
}

export function CampaignBuilderScreen() {
  const { workspace } = useDemo();
  const [title, setTitle] = useState("Aclo Morning Box Story");
  const [objective, setObjective] = useState("Explore Breakfast Discovery");
  const [productId, setProductId] = useState("");
  const [budget, setBudget] = useState("300");
  const [days, setDays] = useState("14");
  const action = useDemoAction();
  return (
    <DemoReady>
      {(data) => (
        <Screen
          eyebrow="INTERNAL CAMPAIGN BUILDER"
          title="Create Campaign with Yamdy AI"
          subtitle="Structure a sample campaign brief. No advertising or bidding endpoint is connected."
          actions={
            <Link className="secondary-button" to="/app/marketing">
              Back to marketing
            </Link>
          }
        >
          <div className="demo-split">
            <div className="demo-stack">
              <Panel title="Select Business Objective">
                <div className="demo-filter-row">
                  {[
                    "Explore Breakfast Discovery",
                    "Increase Overall Volume",
                    "Launch New Product",
                    "Boost Weak Branch",
                    "Acquire New Diners",
                    "Defend Competitor Share",
                  ].map((option) => (
                    <button
                      key={option}
                      className={`demo-filter${objective === option ? " is-active" : ""}`}
                      onClick={() => setObjective(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </Panel>
              <Panel title="Campaign Structure & Schedule">
                <div className="demo-form-grid">
                  <label className="demo-field">
                    Campaign title
                    <input
                      className="demo-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </label>
                  <label className="demo-field">
                    Duration in days
                    <input
                      className="demo-input"
                      type="number"
                      min="1"
                      max="90"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                    />
                  </label>
                </div>
                <p className="demo-help">
                  Schedule is stored as a plan only; no placement is reserved.
                </p>
              </Panel>
              <Panel title="Featured Menu Products">
                <select
                  className="demo-select"
                  aria-label="Featured product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="">Select a product</option>
                  {data.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_en}
                    </option>
                  ))}
                </select>
              </Panel>
              <Panel title="Placement & API Distribution">
                <div className="demo-sample-card">
                  <span className="demo-icon-box">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <strong>Suggested concept: breakfast discovery</strong>
                    <p>
                      Illustrative placement only. HungerStation marketing entitlement is
                      unverified.
                    </p>
                  </div>
                </div>
              </Panel>
            </div>
            <div className="demo-stack">
              <Panel title="Budget & Bidding Controls">
                <label className="demo-field">
                  Planning budget (SAR)
                  <input
                    className="demo-input"
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </label>
                <p className="demo-help">
                  No financial action is initiated. Budget is an internal number only.
                </p>
              </Panel>
              <Panel title="Projected Outcome (14 Days)">
                <div className="demo-kv">
                  <div>
                    <small>Planned spend</small>
                    <strong>{formatSar(budget)}</strong>
                  </div>
                  <div>
                    <small>Attributed orders</small>
                    <strong>Unknown</strong>
                  </div>
                  <div>
                    <small>Projected revenue</small>
                    <strong>Unverified</strong>
                  </div>
                  <div>
                    <small>Confidence</small>
                    <strong>Not available</strong>
                  </div>
                </div>
                <p className="demo-help">
                  The Stitch projection requires real attribution and a validated model, so this
                  demo does not invent one.
                </p>
              </Panel>
              <Panel title="Save for human review">
                <ActionFeedback error={action.error} success={action.success} />
                <button
                  className="primary-button"
                  disabled={
                    action.busy || title.trim().length < 3 || Number(budget) < 0 || Number(days) < 1
                  }
                  onClick={() =>
                    void action.run(
                      () =>
                        saveDemoDraft(workspace.id, "campaign", title, {
                          objective,
                          product_id: productId || null,
                          budget_sar: Number(budget),
                          duration_days: Number(days),
                          source: "demo",
                          channel_request_sent: false,
                        }),
                      "Campaign brief saved internally. No ad campaign was created.",
                    )
                  }
                >
                  Save as Draft
                </button>
              </Panel>
            </div>
          </div>
        </Screen>
      )}
    </DemoReady>
  );
}

export function BidsScreen() {
  const { workspace } = useDemo();
  const [selected, setSelected] = useState<string | null>(null);
  const [bid, setBid] = useState("4.20");
  const action = useDemoAction();
  return (
    <DemoReady>
      {(data) => {
        const product = data.products.find((p) => p.id === selected) ?? data.products[0];
        return (
          <Screen
            eyebrow="SPONSORED SEARCH EXPLORATION"
            title="Search & Bid Optimization"
            subtitle="Sample bid assumptions only; no external bidding or visibility API is connected."
            actions={
              <Link className="secondary-button" to="/app/marketing">
                Marketing hub
              </Link>
            }
          >
            <div className="demo-grid demo-grid--three">
              <Stat label="Products in matrix" value={data.products.length} />
              <Stat label="Live visibility share" value="Unavailable" tone="orange" />
              <Stat label="Bid API" value="Unverified" tone="purple" />
            </div>
            <div className="demo-split">
              <Panel title="Sample bid matrix">
                <div className="demo-table-wrap">
                  <table className="demo-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Current bid</th>
                        <th>Suggested demo bid</th>
                        <th>Visibility</th>
                        <th>Conversion</th>
                        <th>Expected impact</th>
                        <th>Confidence</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.map((p, index) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name_en}</strong>
                          </td>
                          <td>Unknown</td>
                          <td>{formatSar(3.4 + index * 0.35)}</td>
                          <td>Not connected</td>
                          <td>Not connected</td>
                          <td>Unverified</td>
                          <td>—</td>
                          <td>
                            <Pill tone="purple">Demo</Pill>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setSelected(p.id);
                                setBid((3.4 + index * 0.35).toFixed(2));
                              }}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <div className="demo-stack">
                <Panel title={`${product?.name_en ?? "Product"} — Sponsored Search`}>
                  <p className="demo-help">
                    The reference design shows a bid recommendation. Here it is an editable internal
                    assumption.
                  </p>
                  <label className="demo-field">
                    Draft bid (SAR)
                    <input
                      className="demo-input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={bid}
                      onChange={(e) => setBid(e.target.value)}
                    />
                  </label>
                  <p className="demo-help">No budget is spent and no bid is published.</p>
                  <ActionFeedback error={action.error} success={action.success} />
                  <button
                    className="primary-button"
                    disabled={!product || action.busy || Number(bid) < 0}
                    onClick={() => {
                      if (!product) return;
                      void action.run(
                        () =>
                          saveDemoDraft(workspace.id, "campaign", `Bid plan · ${product.name_en}`, {
                            product_id: product.id,
                            bid_sar: Number(bid),
                            source: "demo",
                            channel_request_sent: false,
                          }),
                        "Internal bid plan saved. No external action occurred.",
                      );
                    }}
                  >
                    Save bid plan
                  </button>
                </Panel>
                <Panel title="Budget Protection & Safety Guardrails">
                  <ul className="demo-help">
                    <li>Human approval is required before any future financial action.</li>
                    <li>Partner capability and spending entitlement are unverified.</li>
                    <li>Simulated values are never described as observed bids.</li>
                  </ul>
                </Panel>
              </div>
            </div>
          </Screen>
        );
      }}
    </DemoReady>
  );
}
