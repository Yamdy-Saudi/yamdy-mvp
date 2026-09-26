# Yamdy Auth emails

The repository is the source of truth for the six Supabase Auth email templates in `supabase/templates/`. The design follows approved Stitch project `projects/8813799588670496359`, screen 1: green `#167d48`, charcoal `#1b1c1e`, warm cream `#f9f4ec`, 10–12 px rounding, and a simple IBM Plex Sans direction with Arial/Helvetica fallbacks for mail clients. HTML uses tables, inline styles, semantic text, image alt text, and a visible raw link where there is a link action.

| Flow | Template | Subject | Action variable |
|---|---|---|---|
| Sign-up confirmation | `confirmation.html` | Welcome to Yamdy — confirm your email | `{{ .ConfirmationURL }}` |
| Invitation | `invite.html` | You've been invited to Yamdy | `{{ .ConfirmationURL }}` |
| Password recovery | `recovery.html` | Reset your Yamdy password | `{{ .ConfirmationURL }}` |
| Magic link / email OTP | `magic_link.html` | Your Yamdy sign-in link | `{{ .ConfirmationURL }}`, `{{ .Token }}` |
| Email change | `email_change.html` | Confirm your new Yamdy email address | `{{ .ConfirmationURL }}` |
| Reauthentication | `reauthentication.html` | Verify your Yamdy account | `{{ .Token }}` |

Supabase uses the **same `magic_link` template for magic links and email OTP**. There is no separate email OTP template in the current configuration. The reauthentication template is code only. The invitation copy is generic because workspace/inviter metadata is not guaranteed. Templates also use `{{ .SiteURL }}` for the logo asset. See [Supabase Auth email templates](https://supabase.com/docs/guides/auth/auth-email-templates) and [local template configuration](https://supabase.com/docs/guides/local-development/customizing-email-templates).

## Hosted project setup

`supabase/config.toml` records subjects and template paths but **does not deploy Auth email settings to the hosted project**. `supabase_yamdy` MCP currently has no Auth template or URL configuration operation. An administrator must set the six subjects and paste each committed HTML template at Supabase Dashboard → Authentication → Email Templates for project `ocwgdprgoelmqbspkdms`. Set Authentication → URL Configuration Site URL to `https://app.yamdy.net`. Allow the callback and reset routes on that domain, plus the exact local development redirect URLs in `supabase/config.toml` if local click-through is required. Keep email confirmation enabled. Do not change SMTP or sender settings.

The logo source is `public/yamdy-logo.png`. It must be publicly served at `https://app.yamdy.net/yamdy-logo.png` before activating these templates. `{{ .SiteURL }}/yamdy-logo.png` follows the configured Site URL; if an email client blocks the image, `alt="Yamdy"` remains. Verify the production URL returns an image before pasting templates into the hosted Dashboard.

As checked on 2026-09-26, `app.yamdy.net` did not resolve from this environment. Deploy the app and configure that DNS name before hosted email activation. The HTML also includes visible Yamdy text when images are unavailable.

## Application flow

- Sign-up sets `emailRedirectTo` to `/auth/callback?flow=confirmation`.
- Password recovery starts from **Forgot password?** on `/signin`, sends the user to `/auth/reset-password`, and allows a new password only after a valid Auth session is established by the email link.
- Passwordless sign-in starts from **Email me a sign-in link** and returns to `/auth/callback?flow=magic-link`; existing users only (`shouldCreateUser: false`).
- Invitation links can use `/auth/callback?flow=invite` through the server-side `inviteUserByEmail` redirect option when invitations are implemented. An invitation does not by itself grant a Yamdy workspace membership.
- Callback and reset pages show expired, invalid, success, and loading states. Supabase's browser client processes the link; pages check for URL proof and an established session. Any optional `next` destination is restricted to a same-origin `/app` path.

## Preview and tests without Docker

Run `node scripts/auth-email-templates.mjs preview`, then open the HTML files in `.email-preview/` in a browser. They contain only dummy links and a dummy code, and the directory is Git ignored. Run `node scripts/auth-email-templates.mjs generate` after editing the shared generator, then review the six version-controlled HTML files. `npm run test:unit` validates template markers and callback parsing; `npm run typecheck`, `npm run lint`, and `npm run build` verify the app.

For a live email click-through in development, run `npm run dev` on port 8080, add the exact localhost redirects to the hosted Auth URL allow list, and trigger sign-up, reset, or passwordless sign-in using a test mailbox. The hosted project's default email sender has limits and may restrict recipients; delivery is not guaranteed. This project deliberately does not require a local Supabase stack or Docker. Real invite tests require a future server-side invitation workflow with workspace membership assignment.

## Deferred delivery work

The default Supabase transport and sender remain in place. Before broad production sending, configure a dedicated transactional provider and authenticated domain for `Yamdy <no-reply@auth.yamdy.net>`, with SPF, DKIM, and DMARC, after separate approval. That change is outside this work.
