export type EmailFlow = "confirmation" | "invite" | "magic-link" | "email-change" | "recovery";

export function emailFlow(value: string | null): EmailFlow {
  if (value === "magiclink") return "magic-link";
  if (value === "email_change") return "email-change";
  if (
    value === "invite" ||
    value === "magic-link" ||
    value === "email-change" ||
    value === "recovery"
  )
    return value;
  return "confirmation";
}

export function safeAuthDestination(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return null;
  const url = new URL(value, "https://app.yamdy.net");
  if (
    url.origin !== "https://app.yamdy.net" ||
    (url.pathname !== "/app" && !url.pathname.startsWith("/app/"))
  )
    return null;
  return url.pathname + url.search;
}

export function authEmailError(search: string, hash: string): "expired" | "invalid" | null {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const code = query.get("error_code") || fragment.get("error_code") || "";
  const description = query.get("error_description") || fragment.get("error_description") || "";
  if (/expired/i.test(code + " " + description)) return "expired";
  if (query.has("error") || fragment.has("error")) return "invalid";
  return null;
}

export function hasAuthProof(search: string, hash: string): boolean {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  return query.has("code") || fragment.has("access_token") || query.has("token_hash");
}
