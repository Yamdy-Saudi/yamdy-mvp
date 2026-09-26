import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const templates = {
  confirmation: {
    title: "Welcome to Yamdy",
    body: "Confirm your email to finish setting up your Yamdy workspace.",
    action: "Confirm email",
    security: "If you didn't create a Yamdy account, you can safely ignore this email.",
    link: true,
  },
  invite: {
    title: "You're invited to Yamdy",
    body: "You've been invited to join Yamdy. Accept the invitation to get started with your team.",
    action: "Accept invitation",
    security: "If you weren't expecting this invitation, you can safely ignore this email.",
    link: true,
  },
  recovery: {
    title: "Reset your password",
    body: "We received a request to reset the password for your Yamdy account.",
    action: "Reset password",
    security:
      "If you didn't request this, you can ignore this email. Your password will remain unchanged.",
    link: true,
  },
  magic_link: {
    title: "Sign in to Yamdy",
    body: "Use this one-time link to sign in to your Yamdy account. It expires soon and should not be shared.",
    action: "Sign in to Yamdy",
    security:
      "If you didn't request a sign-in link, you can safely ignore this email. Never share this code with anyone.",
    link: true,
    code: true,
  },
  email_change: {
    title: "Confirm your new email",
    body: "Confirm this address to complete the email change on your Yamdy account.",
    action: "Confirm new email",
    security:
      "If you didn't request this change, do not click the button. Contact your workspace administrator.",
    link: true,
  },
  reauthentication: {
    title: "Confirm it's you",
    body: "Enter this code in Yamdy to verify your identity for a sensitive account action.",
    security:
      "Never share this code with anyone. If you didn't request it, review your account security.",
    code: true,
  },
};

function render(data) {
  const button = data.link
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 24px"><tr><td bgcolor="#167d48" style="border-radius:10px;background:#167d48"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:15px 24px;border:1px solid #167d48;border-radius:10px;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;line-height:20px">${data.action}</a></td></tr></table>`
    : "";
  const code = data.code
    ? `<p style="margin:24px 0 8px;font-size:13px;line-height:20px;color:#3f4940">Your verification code</p><p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:bold;letter-spacing:5px;line-height:38px;color:#1b1c1e">{{ .Token }}</p>`
    : "";
  const fallback = data.link
    ? `<p style="margin:28px 0 8px;font-size:13px;line-height:20px;color:#3f4940">If the button doesn't work, copy and paste this link into your browser:</p><p style="margin:0 0 22px;overflow-wrap:anywhere;word-break:break-word;font-size:13px;line-height:20px"><a href="{{ .ConfirmationURL }}" style="color:#006235;text-decoration:underline">{{ .ConfirmationURL }}</a></p>`
    : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Yamdy</title></head>
<body style="margin:0;padding:0;background:#f9f4ec;color:#1b1c1e;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9f4ec" style="background:#f9f4ec"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border:1px solid #eae5dc;border-radius:12px"><tr><td style="padding:32px 32px 0">
<img src="{{ .SiteURL }}/yamdy-logo.png" width="150" alt="Yamdy" style="display:block;width:150px;max-width:100%;height:auto;border:0;color:#006235;font-size:22px;font-weight:bold"><span style="display:block;padding-top:8px;color:#006235;font-size:14px;font-weight:bold">Yamdy</span>
</td></tr><tr><td style="padding:30px 32px 32px">
<h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:bold;line-height:36px;color:#1b1c1e">${data.title}</h1>
<p style="margin:0;font-size:16px;line-height:25px;color:#3f4940">${data.body}</p>
${button}${code}
<p style="margin:24px 0 0;padding:16px 0 0;border-top:1px solid #eae5dc;font-size:14px;line-height:22px;color:#3f4940">${data.security}</p>
${fallback}
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px"><tr><td align="center" style="padding:24px 20px;color:#635e54;font-size:12px;line-height:20px">
Need help? <a href="mailto:support@yamdy.net" style="color:#006235;text-decoration:underline">support@yamdy.net</a><br>© Yamdy · Saudi Arabia
</td></tr></table>
</td></tr></table></body></html>\n`;
}

const mode = process.argv[2];
if (mode === "generate") {
  await mkdir(new URL("../supabase/templates/", import.meta.url), { recursive: true });
  for (const [name, data] of Object.entries(templates)) {
    await writeFile(new URL(`../supabase/templates/${name}.html`, import.meta.url), render(data));
  }
} else if (mode === "preview") {
  const destination = new URL("../.email-preview/", import.meta.url);
  await mkdir(destination, { recursive: true });
  for (const name of Object.keys(templates)) {
    let html = await readFile(
      new URL(`../supabase/templates/${name}.html`, import.meta.url),
      "utf8",
    );
    html = html
      .replaceAll("{{ .SiteURL }}", "https://app.yamdy.net")
      .replaceAll(
        "{{ .ConfirmationURL }}",
        "https://app.yamdy.net/auth/callback?flow=confirmation&amp;preview=1",
      )
      .replaceAll("{{ .Token }}", "123456");
    await writeFile(join(fileURLToPath(destination), `${name}.html`), html);
  }
  console.log("Preview files written to .email-preview/ (dummy links and code only).");
} else {
  console.error("Usage: node scripts/auth-email-templates.mjs generate|preview");
  process.exitCode = 1;
}
