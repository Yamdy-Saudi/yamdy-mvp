import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthResult } from "../../components/auth-result";
import {
  authEmailError,
  emailFlow,
  hasAuthProof,
  safeAuthDestination,
} from "../../lib/auth-email-flow";
import { getSupabase } from "../../lib/supabase";

export const Route = createFileRoute("/auth/callback")({ component: AuthCallback });

function AuthCallback() {
  const [state, setState] = useState<"loading" | "success" | "expired" | "invalid">("loading");
  const [flow, setFlow] = useState(emailFlow(null));
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const currentFlow = emailFlow(params.get("flow") ?? fragment.get("type"));
    setFlow(currentFlow);
    setDestination(safeAuthDestination(params.get("next")));
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
    void client.auth.getSession().then(({ data, error }) => {
      if (active) setState(error || !data.session ? "invalid" : "success");
    });
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading")
    return (
      <AuthResult
        title="Verifying your link"
        description="One moment while we finish signing you in."
      />
    );
  if (state === "expired")
    return (
      <AuthResult
        error
        title="This link has expired"
        description="Request a new email from the sign-in page and try again."
      />
    );
  if (state === "invalid")
    return (
      <AuthResult
        error
        title={flow === "invite" ? "Invitation unavailable" : "We couldn't verify this link"}
        description="The link may have been used already or may be invalid. Request a new email and try again."
      />
    );
  const labels = {
    confirmation: [
      "Email confirmed",
      "Your Yamdy email is verified. Sign in to finish your workspace setup.",
    ],
    invite: [
      "Invitation accepted",
      "Your Yamdy account is ready. Your workspace administrator can grant access if it is not visible yet.",
    ],
    "magic-link": ["You're signed in", "Your Yamdy sign-in link worked."],
    "email-change": ["Email confirmed", "Your email change has been verified."],
    recovery: ["Link verified", "You can now set a new password."],
  }[flow];
  return (
    <AuthResult
      title={labels[0] ?? "Email verified"}
      description={labels[1] ?? "You can continue to Yamdy."}
    >
      {destination ? (
        <a className="primary-button full-width auth-result-action" href={destination}>
          Continue to Yamdy
        </a>
      ) : flow === "confirmation" ? (
        <Link className="primary-button full-width auth-result-action" to="/signin">
          Sign in
        </Link>
      ) : (
        <Link className="primary-button full-width auth-result-action" to="/app">
          Continue to Yamdy
        </Link>
      )}
    </AuthResult>
  );
}
