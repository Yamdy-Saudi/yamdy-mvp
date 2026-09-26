import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AuthResult } from "../../components/auth-result";
import { authEmailError, hasAuthProof } from "../../lib/auth-email-flow";
import { updatePassword } from "../../lib/auth";
import { getSupabase } from "../../lib/supabase";

export const Route = createFileRoute("/auth/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const [state, setState] = useState<"loading" | "ready" | "expired" | "invalid" | "saved">(
    "loading",
  );
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const result = authEmailError(window.location.search, window.location.hash);
    if (result) {
      setState(result);
      return;
    }
    if (!hasAuthProof(window.location.search, window.location.hash)) {
      setState("invalid");
      return;
    }
    const client = getSupabase();
    if (!client) {
      setState("invalid");
      return;
    }
    let active = true;
    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (active) setState(sessionError || !data.session ? "invalid" : "ready");
    });
    return () => {
      active = false;
    };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await updatePassword(password);
      setState("saved");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }
  if (state === "loading")
    return (
      <AuthResult
        title="Checking your reset link"
        description="One moment while we verify your request."
      />
    );
  if (state === "expired")
    return (
      <AuthResult
        error
        title="Reset link expired"
        description="Request a new password reset email from the sign-in page."
      />
    );
  if (state === "invalid")
    return (
      <AuthResult
        error
        title="Reset link unavailable"
        description="This link may have been used already. Request a new password reset email."
      />
    );
  if (state === "saved")
    return (
      <AuthResult title="Password updated" description="Your Yamdy password has been changed.">
        <Link className="primary-button full-width auth-result-action" to="/app">
          Continue to Yamdy
        </Link>
      </AuthResult>
    );
  return (
    <AuthResult
      title="Set a new password"
      description="Choose a password with at least 8 characters."
    >
      <form
        className="signup-form"
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <label>
          New password
          <input
            className="plain-field"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button full-width" disabled={busy}>
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthResult>
  );
}
