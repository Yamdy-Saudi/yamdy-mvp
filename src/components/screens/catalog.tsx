import { Link } from "@tanstack/react-router";
import { ArrowRight, ChefHat, Image as ImageIcon, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useDemo } from "../demo-provider";
import {
  ActionFeedback,
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
import { saveProductDraft } from "../../lib/demo";
import type { DemoData } from "../../lib/demo";

function ProductArt({ name, imagePath }: { name: string; imagePath: string | null }) {
  return (
    <div className="demo-product-art" aria-label={`Illustration for ${name}`}>
      {imagePath ? (
        <img src={imagePath} alt={`Illustrative ${name} concept`} />
      ) : (
        <ChefHat size={42} />
      )}
      <small>Illustrative concept image · not channel photography</small>
    </div>
  );
}

export function ListingsScreen() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  return (
    <DemoReady>
      {(data) => {
        const categories = [...new Set(data.products.map((p) => p.category))];
        const rows = data.products.filter((p) => {
          const unavailable = data.productStates.some(
            (s) => s.product_id === p.id && !s.is_available,
          );
          return (
            (tab !== "unavailable" || unavailable) &&
            (category === "all" || p.category === category) &&
            `${p.name_en} ${p.name_ar} ${p.sku}`.toLowerCase().includes(query.toLowerCase())
          );
        });
        return (
          <Screen
            eyebrow="MENU OPERATIONS"
            title="Listings"
            subtitle="Internal catalog drafts mapped to your demo branches."
            actions={
              <button className="secondary-button" onClick={() => window.print()}>
                Export visible catalog
              </button>
            }
          >
            <div className="demo-grid">
              <Stat label="Demo products" value={data.products.length} />
              <Stat label="Categories" value={categories.length} />
              <Stat
                label="Unavailable states"
                value={data.productStates.filter((s) => !s.is_available).length}
                tone="orange"
              />
              <Stat
                label="Average listing quality"
                value={`${Math.round(data.products.reduce((n, p) => n + p.listing_quality, 0) / Math.max(1, data.products.length))}%`}
                tone="purple"
              />
            </div>
            <Panel title="Sample catalog" aside={<Pill tone="purple">Internal drafts only</Pill>}>
              <div className="demo-filter-row" style={{ marginBottom: 16 }}>
                {(
                  [
                    ["all", "All Products"],
                    ["unavailable", "Unavailable"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    className={`demo-filter${tab === id ? " is-active" : ""}`}
                    onClick={() => setTab(id)}
                  >
                    {label}
                  </button>
                ))}
                <select
                  className="demo-select"
                  aria-label="Category filter"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All categories</option>
                  {categories.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                <input
                  className="demo-search"
                  aria-label="Search listings"
                  placeholder="Search menu or SKU"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="demo-table-wrap">
                <table className="demo-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Availability</th>
                      <th>Listing quality</th>
                      <th>Branch coverage</th>
                      <th>HungerStation status</th>
                      <th>Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => {
                      const states = data.productStates.filter((s) => s.product_id === p.id);
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="demo-product-name">
                              {p.image_path && <img src={p.image_path} alt="" loading="lazy" />}
                              <strong>{p.name_en}</strong>
                            </div>
                            <small>
                              {p.name_ar} · {p.sku}
                            </small>
                          </td>
                          <td>{p.category}</td>
                          <td>
                            {formatSar(p.price_sar)}
                            <small>
                              {p.price_basis === "historical_single_item_subtotal"
                                ? "Historical single-item subtotal"
                                : "Illustrative price"}
                            </small>
                          </td>
                          <td>
                            <Pill tone={states.some((s) => !s.is_available) ? "orange" : "green"}>
                              {states.filter((s) => s.is_available).length}/{states.length} sample
                              branches
                            </Pill>
                          </td>
                          <td>
                            <div className="demo-progress">
                              <span style={{ width: `${p.listing_quality}%` }} />
                            </div>
                            <small>{p.listing_quality}%</small>
                          </td>
                          <td>{states.length} branches</td>
                          <td>
                            <Pill tone="purple">Mock · no sync</Pill>
                          </td>
                          <td>{formatDate(p.updated_at)}</td>
                          <td>
                            <Link to="/app/listings/$id" params={{ id: p.id }}>
                              Edit draft →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!rows.length && (
                  <Empty
                    title="No matching products"
                    detail="Try another category or search term."
                  />
                )}
              </div>
            </Panel>
            <div className="demo-split">
              <Panel title="Listing quality diagnostic">
                <p className="demo-help">
                  Quality scores are illustrative and based on sample content completeness. They are
                  not HungerStation ratings.
                </p>
                <div className="demo-card-list">
                  {data.products
                    .filter((p) => p.listing_quality < 80)
                    .slice(0, 3)
                    .map((p) => (
                      <div key={p.id} className="demo-sample-card">
                        <span className="demo-icon-box">
                          <Search size={19} />
                        </span>
                        <div>
                          <strong>
                            {p.name_en} · {p.listing_quality}%
                          </strong>
                          <p>Review title, description and imagery in an internal draft.</p>
                          <Link
                            className="text-link"
                            to="/app/listings/$id/optimize"
                            params={{ id: p.id }}
                          >
                            Review suggestions →
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              </Panel>
              <Panel title="Publishing boundary">
                <p>
                  Product content creation, image and modifier writes are not verified for this
                  restaurant integration.
                </p>
                <Pill tone="purple">No live publish control</Pill>
                <p className="demo-help">
                  Draft edits stay inside Yamdy. The mock adapter does not send a catalog update.
                </p>
              </Panel>
            </div>
          </Screen>
        );
      }}
    </DemoReady>
  );
}

function ProductForm({ product, data }: { product: DemoData["products"][number]; data: DemoData }) {
  const [nameEn, setNameEn] = useState(product.name_en);
  const [nameAr, setNameAr] = useState(product.name_ar);
  const [description, setDescription] = useState(product.description_en);
  const [price, setPrice] = useState(String(product.price_sar));
  const action = useDemoAction();
  const states = data.productStates.filter((s) => s.product_id === product.id);
  return (
    <Screen
      eyebrow="CATALOG / PRODUCT DRAFT"
      title={product.name_en}
      subtitle={`${product.sku} · ${product.category} · Internal Yamdy record`}
      actions={
        <Link className="secondary-button" to="/app/listings">
          Back to listings
        </Link>
      }
    >
      <div className="demo-split">
        <div className="demo-stack">
          <Panel title="General Information">
            <div className="demo-form">
              <div className="demo-form-grid">
                <label className="demo-field">
                  English name
                  <input
                    className="demo-input"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </label>
                <label className="demo-field">
                  Arabic name
                  <input
                    className="demo-input"
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                  />
                </label>
              </div>
              <label className="demo-field">
                English description
                <textarea
                  className="demo-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <div className="demo-actions">
                <Link
                  className="text-link"
                  to="/app/listings/$id/optimize"
                  params={{ id: product.id }}
                >
                  <Sparkles size={16} /> Improve with Yamdy demo suggestions →
                </Link>
              </div>
            </div>
          </Panel>
          <Panel title="Pricing & Economics">
            <div className="demo-form-grid">
              <label className="demo-field">
                Internal sample price (SAR)
                <input
                  className="demo-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
              <div className="demo-kv">
                <div>
                  <small>Sample cost assumption</small>
                  <strong>
                    {product.cost_sar == null ? "Unknown" : formatSar(product.cost_sar)}
                  </strong>
                </div>
                <div>
                  <small>Estimated gross margin</small>
                  <strong>
                    {product.cost_sar
                      ? `${Math.round((100 * (Number(price) - Number(product.cost_sar))) / Math.max(Number(price), 1))}%`
                      : "Unknown"}
                  </strong>
                </div>
              </div>
            </div>
            <p className="demo-help">
              {product.price_basis === "historical_single_item_subtotal"
                ? "This box price matches a historical single-item order subtotal. It does not verify today's channel price."
                : "This price is illustrative."}{" "}
              COGS is unknown.
            </p>
          </Panel>
          <Panel title="Branch Stock Availability">
            <div className="demo-card-list">
              {states.map((state) => (
                <div className="demo-sample-card" key={state.branch_id}>
                  <span className="demo-icon-box">
                    <ChefHat size={18} />
                  </span>
                  <div>
                    <strong>{data.branches.find((b) => b.id === state.branch_id)?.name}</strong>
                    <p>{formatSar(state.price_sar)} · Sample branch state</p>
                    <Pill tone={state.is_available ? "green" : "orange"}>
                      {state.is_available ? "Available" : "Unavailable"}
                    </Pill>
                  </div>
                </div>
              ))}
            </div>
            <p className="demo-help">
              Availability changes are internal demo actions from the opportunity workflow.
            </p>
          </Panel>
          <Panel title="Modifiers & Add-ons">
            <p className="demo-help">
              Modifier editing is a draft-only concept until partner entitlement and API support are
              verified.
            </p>
            <Pill tone="purple">Not connected</Pill>
          </Panel>
        </div>
        <div className="demo-stack">
          <Panel title="Product image">
            <ProductArt name={product.name_en} imagePath={product.image_path} />
            <p className="demo-help">
              Generated concept image for an internal draft. Image publishing is unavailable.
            </p>
          </Panel>
          <Panel title="Listing Quality Health">
            <strong style={{ fontSize: 30, color: "#006235" }}>{product.listing_quality}%</strong>
            <div className="demo-progress">
              <span style={{ width: `${product.listing_quality}%` }} />
            </div>
            <p className="demo-help">
              Sample completeness estimate. No live quality score is available.
            </p>
          </Panel>
          <Panel title="Sync & Audit Metadata">
            <div className="demo-kv">
              <div>
                <small>Source</small>
                <strong>Demo fixture</strong>
              </div>
              <div>
                <small>Last draft update</small>
                <strong>{formatDate(product.updated_at)}</strong>
              </div>
              <div>
                <small>Channel status</small>
                <strong>Not synchronized</strong>
              </div>
              <div>
                <small>External confirmation</small>
                <strong>Not confirmed</strong>
              </div>
            </div>
          </Panel>
          <Panel title="Save internal draft">
            <ActionFeedback error={action.error} success={action.success} />
            <p className="demo-help">
              Saving updates the Yamdy demo record only. No HungerStation call is made.
            </p>
            <button
              className="primary-button"
              disabled={action.busy || !nameEn.trim() || !Number.isFinite(Number(price))}
              onClick={() =>
                void action.run(
                  () =>
                    saveProductDraft({
                      id: product.id,
                      nameEn,
                      nameAr,
                      descriptionEn: description,
                      priceSar: Number(price),
                    }),
                  "Internal product draft saved. No channel publish occurred.",
                )
              }
            >
              Save draft
            </button>
          </Panel>
        </div>
      </div>
    </Screen>
  );
}

export function ProductDetailScreen({ id }: { id: string }) {
  return (
    <DemoReady>
      {(data) => {
        const product = data.products.find((p) => p.id === id);
        return product ? (
          <ProductForm key={product.id} product={product} data={data} />
        ) : (
          <Empty title="Product not found" detail="It may belong to another workspace." />
        );
      }}
    </DemoReady>
  );
}

function OptimizerContent({ product }: { product: DemoData["products"][number] }) {
  const [accepted, setAccepted] = useState(false);
  const action = useDemoAction();
  const suggestion = `A freshly prepared ${product.name_en.toLowerCase()} with a balanced mix of flavor and texture. Available in your selected demo branches.`;
  return (
    <Screen
      eyebrow="CONTENT DRAFT / DEMO SUGGESTIONS"
      title={`Optimize ${product.name_en}`}
      subtitle="Compare sample copy before applying it to an internal product draft."
      actions={
        <Link className="secondary-button" to="/app/listings/$id" params={{ id: product.id }}>
          Back to product
        </Link>
      }
    >
      <div className="demo-split">
        <div className="demo-stack">
          <Panel title="Why Yamdy recommends these optimizations">
            <p>
              The sample listing can describe the product more clearly. This suggestion was written
              as demonstration copy and has not been evaluated by a live AI model or HungerStation.
            </p>
            <div className="demo-grid demo-grid--three">
              <Stat label="Protein clarity" value="Good" />
              <Stat label="Bread & sauce" value="Improve" tone="orange" />
              <Stat
                label="Copy length"
                value={`${product.description_en.length} chars`}
                tone="purple"
              />
            </div>
          </Panel>
          <Panel title="Compare descriptions">
            <div className="demo-grid demo-grid--two">
              <div className="demo-copy-card">
                <Pill>Current draft</Pill>
                <h3>{product.name_en}</h3>
                <p>{product.description_en}</p>
              </div>
              <div className="demo-copy-card is-suggestion">
                <Pill tone="purple">Suggested sample</Pill>
                <h3>{product.name_en}</h3>
                <p>{suggestion}</p>
                <button className="secondary-button" onClick={() => setAccepted(!accepted)}>
                  {accepted ? "Accepted ✓" : "Accept suggestion"}
                </button>
              </div>
            </div>
          </Panel>
          <Panel title="Image recommendation">
            <div className="demo-sample-card">
              <ImageIcon size={23} />
              <div>
                <strong>Keep current illustrative image</strong>
                <p>Image generation and channel upload are not connected in demo mode.</p>
              </div>
            </div>
          </Panel>
        </div>
        <div className="demo-stack">
          <Panel title="Human Control Guarantee">
            <p className="demo-help">
              You choose which suggestion to retain. Applying it changes only an internal draft;
              there is no publication API call.
            </p>
            <ActionFeedback error={action.error} success={action.success} />
            <button
              className="primary-button"
              disabled={!accepted || action.busy}
              onClick={() =>
                void action.run(
                  () =>
                    saveProductDraft({
                      id: product.id,
                      nameEn: product.name_en,
                      nameAr: product.name_ar,
                      descriptionEn: suggestion,
                      priceSar: Number(product.price_sar),
                    }),
                  "Suggested copy applied to the internal draft.",
                )
              }
            >
              Apply to product draft <ArrowRight size={16} />
            </button>
          </Panel>
          <Panel title="Listing context">
            <ProductArt name={product.name_en} imagePath={product.image_path} />
            <p className="demo-help">
              Listing quality {product.listing_quality}% · Sample diagnostic
            </p>
          </Panel>
        </div>
      </div>
    </Screen>
  );
}

export function ContentOptimizerScreen({ id }: { id: string }) {
  const { workspace } = useDemo();
  return (
    <DemoReady>
      {(data) => {
        const product = data.products.find((p) => p.id === id);
        return product ? (
          <OptimizerContent key={`${workspace.id}-${product.id}`} product={product} />
        ) : (
          <Empty title="Product not found" detail="It may belong to another workspace." />
        );
      }}
    </DemoReady>
  );
}
