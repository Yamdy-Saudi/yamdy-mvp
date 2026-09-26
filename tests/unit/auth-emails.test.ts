import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  requestMagicLinkWith,
  requestPasswordResetWith,
  updatePasswordWith,
} from "../../src/lib/auth";
import {
  authEmailError,
  emailFlow,
  hasAuthProof,
  safeAuthDestination,
} from "../../src/lib/auth-email-flow";
import type { Database } from "../../src/types/database.generated";

test("confirmation and invitation callback states are classified", () => {
  assert.equal(emailFlow("invite"), "invite");
  assert.equal(emailFlow("magic-link"), "magic-link");
  assert.equal(emailFlow("unknown"), "confirmation");
  assert.equal(emailFlow("magiclink"), "magic-link");
  assert.equal(hasAuthProof("?code=dummy-code", ""), true);
  assert.equal(hasAuthProof("", "#access_token=dummy-token"), true);
  assert.equal(hasAuthProof("?flow=invite", ""), false);
});

test("reset and passwordless requests use app routes and cannot create a new user", async () => {
  const calls: unknown[] = [];
  const client = {
    auth: {
      resetPasswordForEmail: async (...args: unknown[]) => {
        calls.push(["reset", ...args]);
        return { error: null };
      },
      signInWithOtp: async (...args: unknown[]) => {
        calls.push(["magic", ...args]);
        return { error: null };
      },
      updateUser: async (...args: unknown[]) => {
        calls.push(["update", ...args]);
        return { error: null };
      },
    },
  } as unknown as SupabaseClient<Database>;
  await requestPasswordResetWith(client, "  user@example.com ", "https://app.yamdy.net");
  await requestMagicLinkWith(client, "  user@example.com ", "https://app.yamdy.net");
  await updatePasswordWith(client, "new-password-123");
  assert.deepEqual(calls, [
    ["reset", "user@example.com", { redirectTo: "https://app.yamdy.net/auth/reset-password" }],
    [
      "magic",
      {
        email: "user@example.com",
        options: {
          shouldCreateUser: false,
          emailRedirectTo: "https://app.yamdy.net/auth/callback?flow=magic-link",
        },
      },
    ],
    ["update", { password: "new-password-123" }],
  ]);
});

test("expired and invalid auth links get safe result states", () => {
  assert.equal(authEmailError("?error=access_denied&error_code=otp_expired", ""), "expired");
  assert.equal(
    authEmailError("", "#error=access_denied&error_description=Token%20invalid"),
    "invalid",
  );
  assert.equal(authEmailError("?flow=confirmation", "#access_token=dummy"), null);
});

test("return destination rejects external, scheme-relative, and non-app URLs", () => {
  assert.equal(safeAuthDestination("/app/health?branch=olaya"), "/app/health?branch=olaya");
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/signin",
    "javascript:alert(1)",
  ]) {
    assert.equal(safeAuthDestination(value), null);
  }
});

test("auth templates keep supported variables and email-safe essentials", () => {
  for (const name of [
    "confirmation",
    "invite",
    "recovery",
    "magic_link",
    "email_change",
    "reauthentication",
  ]) {
    const html = readFileSync(
      new URL(`../../supabase/templates/${name}.html`, import.meta.url),
      "utf8",
    );
    assert.match(html, /alt="Yamdy"/);
    assert.match(html, /<table role="presentation"/);
    assert.match(html, /support@yamdy\.net/);
    assert.doesNotMatch(html, /<script|data:image\/|service_role|smtp/i);
    if (name === "reauthentication") assert.match(html, /{{ \.Token }}/);
    else assert.match(html, /{{ \.ConfirmationURL }}/);
  }
});
