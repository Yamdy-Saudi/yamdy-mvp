import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { BrandMark } from "../components/yamdy-shell";
import { signIn } from "../lib/auth";

export const Route = createFileRoute("/signin")({ component: SignIn });

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const workspace = await signIn(email, password);
      if (!workspace) throw new Error("No workspace is assigned to this account.");
      void navigate({
        to:
          workspace.onboardingStage === "connect"
            ? "/onboarding/connect"
            : workspace.onboardingStage === "import"
              ? "/onboarding/import"
              : "/app",
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="signin-page">
      <div className="signin-card">
        <BrandMark />
        <div className="auth-tabs">
          <Link to="/signup">Create workspace</Link>
          <span className="is-active">Sign in</span>
        </div>
        <h1>Welcome back</h1>
        <p>Return to your Yamdy workspace.</p>
        <form
          onSubmit={(event) => {
            void submit(event);
          }}
          className="signup-form"
        >
          <label>
            Work Email
            <input
              className="plain-field"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              className="plain-field"
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="primary-button full-width">
            {busy ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </main>
  );
}
