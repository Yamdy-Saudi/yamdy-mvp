import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Network,
  LockKeyhole,
  Mail,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { BrandMark } from "../components/yamdy-shell";
import { createWorkspaceAccount } from "../lib/auth";

export const Route = createFileRoute("/signup")({ component: SignUp });

function SignUp() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    businessName: "",
    primaryRole: "Owner / Founder",
    acceptedTerms: false,
  });
  const change = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await createWorkspaceAccount(form);
      if (result.needsEmailConfirmation) setConfirmation(true);
      else void navigate({ to: "/onboarding/connect" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create workspace.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="signup-page">
      <div className="signup-card">
        <section className="signup-story">
          <div className="signup-story__top">
            <BrandMark />
            <span className="tiny-status">
              <i /> KSA F&amp;B ENGINE
            </span>
          </div>
          <div className="signup-story__body">
            <h1>Run your aggregator business from one place.</h1>
            <p>
              Manage listings, pricing, promotions, and marketing while Yamdy uncovers actionable
              growth opportunities across your delivery channels.
            </p>
            <div className="benefits">
              <article>
                <span className="benefit-icon">
                  <Network size={21} />
                </span>
                <div>
                  <strong>One control center</strong>
                  <p>One workspace for your branches, catalog and channel operations.</p>
                </div>
              </article>
              <article className="benefit-ai">
                <span className="benefit-icon">
                  <Sparkles size={21} />
                </span>
                <div>
                  <strong>
                    AI-powered recommendations <em>Smart</em>
                  </strong>
                  <p>Review suggested actions with evidence and human approval.</p>
                </div>
              </article>
              <article>
                <span className="benefit-icon">
                  <TrendingUp size={21} />
                </span>
                <div>
                  <strong>Direct aggregator execution</strong>
                  <p>Publish supported, approved changes when partner access is verified.</p>
                </div>
              </article>
            </div>
            <div className="insight-preview">
              <div>
                <Sparkles size={15} /> Development preview <span>Riyadh Hub</span>
              </div>
              <strong>Opportunity-first operations</strong>
              <p>Sample insights are clearly marked until real data is connected.</p>
            </div>
          </div>
          <div className="loop-preview">
            <span>GOVERNED AUTONOMY LOOP</span>
            <div>
              Observe <b>→</b> Diagnose <b>→</b> Recommend <b>→</b> <strong>Human Approval</strong>{" "}
              <b>→</b> Execute <b>→</b> Learn
            </div>
          </div>
        </section>
        <section className="signup-form-panel">
          <div className="signup-form-inner">
            <div className="auth-tabs">
              <span className="is-active">Create workspace</span>
              <Link to="/signin">Sign in</Link>
            </div>
            <div className="form-heading">
              <h2>Create your workspace</h2>
              <p>Start managing your restaurant delivery operations with clarity and control.</p>
            </div>
            {confirmation ? (
              <div className="notice success">
                <strong>Check your email</strong>
                <p>Confirm your account, then sign in to finish creating your workspace.</p>
                <Link to="/signin">Go to sign in →</Link>
              </div>
            ) : (
              <form
                onSubmit={(event) => {
                  void submit(event);
                }}
                className="signup-form"
              >
                <label>
                  Full Name
                  <div className="field-icon">
                    <UserRound size={18} />
                    <input
                      required
                      autoComplete="name"
                      placeholder="Enter your name"
                      value={form.fullName}
                      onChange={(event) => change("fullName", event.target.value)}
                    />
                  </div>
                </label>
                <label>
                  Work Email
                  <div className="field-icon">
                    <Mail size={18} />
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      placeholder="sultan@brand.com"
                      value={form.email}
                      onChange={(event) => change("email", event.target.value)}
                    />
                  </div>
                </label>
                <label>
                  Password <small>Min. 8 characters</small>
                  <div className="field-icon">
                    <LockKeyhole size={18} />
                    <input
                      required
                      type={visible ? "text" : "password"}
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={(event) => change("password", event.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={visible ? "Hide password" : "Show password"}
                      onClick={() => setVisible(!visible)}
                    >
                      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
                <label>
                  Business or Restaurant Group
                  <input
                    required
                    className="plain-field"
                    placeholder="e.g. Sultan Burger Co."
                    value={form.businessName}
                    onChange={(event) => change("businessName", event.target.value)}
                  />
                </label>
                <label>
                  Primary Role
                  <select
                    className="plain-field"
                    value={form.primaryRole}
                    onChange={(event) => change("primaryRole", event.target.value)}
                  >
                    <option>Owner / Founder</option>
                    <option>General Manager</option>
                    <option>E-commerce / Aggregator Lead</option>
                    <option>Restaurant Operator / Area Supervisor</option>
                    <option>Other Executive Role</option>
                  </select>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.acceptedTerms}
                    onChange={(event) => change("acceptedTerms", event.target.checked)}
                  />
                  <span>
                    I understand this is a development workspace. Legal terms and privacy policy are
                    pending review.
                  </span>
                </label>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="primary-button full-width" disabled={busy}>
                  {busy ? "Creating workspace…" : "Create workspace →"}
                </button>
                <p className="form-footnote">
                  Already have an account? <Link to="/signin">Sign in</Link>
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
