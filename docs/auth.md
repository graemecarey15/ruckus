# Authentication

## Overview

Ruckus uses **Supabase email OTP** for passwordless auth. No passwords — users enter their email and get an email with both a **numeric code** and a **magic link**. Either one works.

## How It Works

### Code Path (manual entry)
1. User enters email on `/auth`
2. `sendOtpCode()` sends an OTP via Supabase with `emailRedirectTo` set to `window.location.origin/auth/callback`
3. User enters the 8-digit code from the email
4. `verifyOtpCode()` confirms → session starts → redirect to `returnTo` (or `/library`)

### Magic Link Path (click from email)
1. User clicks the link in the email
2. Supabase redirects to `/auth/callback`
3. `AuthCallback` reads `authReturnTo` from localStorage and redirects there
4. Falls back to `/library` if nothing stored

### Why both?
Supabase sends both in every email. Some people enter codes, some click links. The UI tells users about both options.

## Club Invite Flow
1. Someone shares a link like `ruckus.goodertechs.com/join/ABC123`
2. If not logged in → redirect to `/auth?returnTo=/join/ABC123`
3. `AuthPage` stores `returnTo` in localStorage so the magic link path can pick it up
4. After auth (either path) → user lands on `/join/ABC123` → auto-joins the club → redirects to club page

## Supabase Dashboard Config
- **Site URL:** `https://ruckus.goodertechs.com`
- **Redirect URLs allowlist:** `https://ruckus.goodertechs.com/**` and `http://localhost:5173/**`
- **SMTP:** Resend (custom SMTP) — way higher send limits than Supabase's built-in mailer
- **Rate limits:** Configurable under Authentication → Rate Limits (OTP send cooldown, emails per hour — was bumped from 10/hr)

## Key Files
| File | What it does |
|------|-------------|
| `src/api/auth.ts` | OTP send/verify, sign out, session helpers |
| `src/pages/AuthPage.tsx` | Email entry + code verification UI |
| `src/pages/AuthCallback.tsx` | Handles magic link redirects |
| `src/pages/JoinClub.tsx` | Club invite join flow |
| `src/contexts/AuthContext.tsx` | Auth state provider (user, session, profile) |
