# Phi Sigma Kappa Tutor

A co-branded white-label deployment of the JIE Mastery voice tutoring platform, configured for the Brothers of Phi Sigma Kappa Fraternity. Built on the Cardinal Principles since 1873 — Brotherhood, Scholarship, Character — and shaped to the conviction that excellence is something you practice, not something you wait for. **Powered by JIE Mastery.ai.**

## Setup

This repository is forked from `JIE-UW-Tutor`. The voice pipeline (Deepgram STT, Claude LLM, ElevenLabs TTS, Silero VAD), database schema, authentication, and Stripe integration are unchanged from the upstream.

```bash
npm install
npm run dev
```

The dev server starts the Express API and the Vite-powered React client. For production builds:

```bash
npm run build
npm run start
```

## Required Environment Variables

Configure these in `.env` (see `.env.example` for the canonical list):

- `DATABASE_URL` — PostgreSQL connection string (Drizzle ORM)
- `SESSION_SECRET` — cookie session secret
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — LLM providers
- `DEEPGRAM_API_KEY` — speech-to-text
- `ELEVENLABS_API_KEY` — text-to-speech
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — transactional email
- `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY` — payments (preserved from upstream; PSK access is currently gated by chapter access codes rather than direct payment)
- `APP_URL` — public origin used in email links

Refer to `.env.example` for the full list. Do not commit secrets.

### ⚠ Placeholder domain in source

After the polish commits (`efac7c5`, `c08b1cb`), every hardcoded fallback that previously read `stateuniversity-tutor.ai` was replaced with **`phisig-tutor.ai`**, which is a placeholder — no DNS exists for it yet. Real production values come from environment variables, which override every fallback in source. Set these on the Railway service before exposing the app to Brothers:

- `APP_URL` — full https origin (e.g. `https://tutor.phisigmakappa.org`)
- `ADMIN_EMAIL` — admin notifications, customer-support replies, contact form
- `ADMIN_ALERT_EMAIL` — safety incident alerts (overrides `ADMIN_EMAIL` for those)
- `JIE_LEAD_NOTIFY_EMAIL` — new-lead notifications
- `JIE_SUPPORT_EMAIL` — safety-team copies (typically same as `ADMIN_EMAIL`)
- `RESEND_FROM_EMAIL` — verified `noreply@…` from a Resend-verified domain
- `SESSION_COOKIE_DOMAIN` — only set if cross-subdomain cookies are needed (e.g. `.phisigmakappa.org`)

If those are unset, the app will *function* but outbound emails will reference the placeholder domain.

## Post-Fork Polish (commits `efac7c5` and `c08b1cb`)

These commits removed UW/JIE/State branding leaks the initial fork did not catch. If forking THIS repo into another fraternity build, expect to make analogous changes:

**Round 1 (`efac7c5`)** — client surfaces: HeroBanner constants/headlines, SessionFeedback colors, Support FAQ, account-export filename, navigation/contact/srm/live-support/best-practices/features-benefits/LiveChatWidget/admin-layout fonts, full rewrite of `about-lsis.tsx` from "JIE / 4th-grader Emma / fractions" to "the Cardinal Tutor / Brother Sam, Pi Chapter junior / integration by parts."

**Round 2 (`c08b1cb`)** — server-side outbound surfaces (emails, error toasts, policy pages): admin-email subject lines (`PHI SIGMA KAPPA TUTOR …`), password-reset footer, security-routes contact strings, privacy/terms/contact/trust-safety/schools/subscribe/offer/admin-setup pages, `use-auth.tsx` server-error message, safety-detection blocklist pattern, study-guide download filename, plus all server-side `stateuniversity-tutor.ai` fallback addresses → `phisig-tutor.ai`.

## Known Cosmetic Debt

- **Slideshow imagery**: the 8 `client/src/assets/campus/*.png` files were overwritten with the PSK shield (filenames preserved to avoid breaking ~30 imports across the codebase). The HeroBanner slideshow will visually repeat the same shield 8 times until real brotherhood/study photos are dropped in at the existing filenames. No code change needed once new assets exist.
- **AI tutor identity**: `server/prompts/tutorMind.ts` still introduces the AI as `TutorMind`. The marketing surface calls it "the Cardinal Tutor." This is intentional — `tutorMind.ts` is shared with upstream JIE platforms and renaming would diverge the prompt. The tutor doesn't actually announce its name in normal conversation, so the mismatch is invisible at runtime.

## Branding Notes

The rebrand replaces all University of Wisconsin (UW–Madison, Bucky, Badger) marks with Phi Sigma Kappa identity. Files changed in this rebrand:

- `client/index.html` — title, meta, OG/Twitter cards, Google Fonts (Playfair Display + Open Sans), favicon → PSK shield
- `client/src/index.css` — added `--psk-*` brand tokens, swapped `--font-sans` to Open Sans and `--font-serif` to Playfair Display
- `tailwind.config.ts` — added `psk` color palette and `display` / `body` font families
- `client/src/pages/auth-page.tsx` — full rewrite of the landing/marketing/auth surface in Phi Sig voice (hero, Cardinal Principles, How It Works, testimonials, pricing, footer attribution)
- `client/src/components/navigation-header.tsx` — PSK shield + "Phi Sigma Kappa · The Cardinal Tutor" wordmark
- `client/src/components/footer.tsx` — PSK shield + chapter/Instagram/Facebook links + "Powered by JIE Mastery.ai" attribution
- `client/src/components/HeroBanner.tsx` — logo import switched to PSK shield
- `client/src/pages/home-page.tsx` — Brother welcome copy
- `client/src/pages/dashboard.tsx` — comment updated to PSK
- `package.json` — `name`, `description`, `author`, `copyright` updated
- `client/public/assets/psk-shield.png`, `client/src/assets/psk-shield.png` — official Phi Sigma Kappa crest (downloaded from `phisig.wpenginepowered.com`)
- `client/src/assets/uw-madison-logo.png`, `state-university-logo.png`, `jie-mastery-logo*.{png,jpg}`, `jie-logo.png`, `jie-salesheet.png`, `student-using-jie.png`, `campus/*.png`, `client/public/bascom-hall.png` — content overwritten with PSK shield (filenames preserved to avoid breaking imports across many files)
- All `*.ts`, `*.tsx`, `*.css`, `*.html` files under `client/`, `server/`, `shared/` — copyright headers updated; UW cardinal hex `#C5050C` and `rgba(197,5,12,…)` replaced with PSK cardinal `#B71234` and `rgba(183,18,52,…)`; user-facing strings substituted for "Phi Sigma Kappa Tutor", "Brothers", and "Phi Sigma Kappa Fraternity"
- Deleted: `RAILWAY_EMERGENCY_FIX.md`, `RAILWAY_FINAL_FIX.md`, `RAILWAY_FIX_COMPLETE.md`, `RAILWAY_FIX_GUIDE.md`, `RAILWAY_IMMEDIATE_FIX.md`, `RAILWAY_ONE_COMMAND_FIX.md`, `RAILWAY_PASSWORD_RESET.md`, `REGISTRATION_VALIDATION_FIX.md` (stale UW-era fix logs)

## Trademark Notice

Phi Sigma Kappa Fraternity name, Greek letters (ΦΣΚ), shield, and motto are owned by Phi Sigma Kappa Fraternity, Indianapolis, IN. This repository is a co-branded white-label deployment intended for chapter or HQ-authorized use. A written licensing agreement should be in place before public-facing launch.

---

Powered by JIE Mastery.ai
