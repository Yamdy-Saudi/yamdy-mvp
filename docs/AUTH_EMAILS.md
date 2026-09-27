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

`supabase/config.toml` records subjects and template paths but **does not deploy Auth email settings to the hosted project**. `supabase_yamdy` MCP has no Auth template configuration operation. On 2026-09-27, the hosted project was on Supabase Free. Its Dashboard disabled template subject and body editing with the default email service and offered three options: upgrade to Pro while retaining Supabase email delivery, configure custom SMTP, or configure a Send Email hook. SMTP and delivery hooks remain outside the authorized scope. The six committed templates are therefore **not active** on the hosted project unless Pro is separately authorized and enabled.

The hosted Auth Site URL is `https://yamdy.lovable.app`. Nine exact callback/reset URLs for the live app and local port 8080 are saved in the Dashboard and mirrored in `supabase/config.toml`. Email confirmation remains enabled. When template editing becomes available, paste the six committed HTML files and subjects in Authentication → Emails → Templates. Do not change SMTP or sender settings.

The logo source is `public/yamdy-logo.png`. It is publicly served at `https://yamdy.lovable.app/yamdy-logo.png` (HTTP 200, `image/png`, verified 2026-09-27). `{{ .SiteURL }}/yamdy-logo.png` follows the configured Site URL; if an email client blocks the image, the email retains alt text and visible Yamdy text.

`app.yamdy.net` is a future custom domain and is not used by the current hosted Auth configuration.

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
