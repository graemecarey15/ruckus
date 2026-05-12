# App Store Plan

## Goal
Get Ruckus on the **Apple App Store** and **Google Play Store** while keeping the existing React + Vite + Supabase PWA as the single source of truth.

## Approach: Capacitor

We're wrapping the same Vite build in a native shell via [Capacitor](https://capacitorjs.com). One codebase, two stores. We can add native capabilities (push, share, biometrics) over time as Capacitor plugins without rewriting the React app.

### Why not the alternatives?
| Option | Verdict |
|---|---|
| **PWABuilder** | Good for an Android-only first pass, but iOS reviewers will reject a thin web wrapper. Capacitor is what PWABuilder uses for iOS anyway. |
| **React Native / Expo** | Forces a UI rewrite (no DOM, no Tailwind, different routing). Worth it only if we outgrow Capacitor's WebView for graphics or gestures — neither applies to a CRUD reader. |
| **Flutter** | Full rewrite in Dart. No reuse from the current codebase. |
| **Full native (Swift + Kotlin)** | Two rewrites, two codebases, months per platform. ~5–10% UX polish for that cost — not worth it pre-product-market-fit. |

We'll revisit if specific native gaps show up in user feedback.

## Repo Layout (after Capacitor init)

```
ruckus/
├── src/                   # React app (unchanged)
├── public/                # Static + PWA manifest + icons
├── dist/                  # Vite build output → Capacitor's webDir
├── ios/                   # Generated Xcode project (gitignored selectively)
├── android/               # Generated Android Studio / Gradle project
├── capacitor.config.ts    # App ID, name, webDir
└── ...
```

## Setup Plan

### 1. Promote the PWA basics
Both platforms need a real manifest and icons regardless of native shell.
- `public/manifest.webmanifest` with name, short_name, theme_color, icons.
- A 1024×1024 master icon → run through `@capacitor/assets` to generate every required size for iOS / Android / favicons.
- Optional: register a service worker (helps web; native shell ignores it).

### 2. Install + initialize Capacitor
```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init Ruckus app.goodertechs.ruckus --web-dir=dist
npx cap add ios
npx cap add android
```

### 3. Build / sync workflow
Each release:
```bash
npm run build        # produces dist/
npx cap sync         # copies dist/ into ios/ and android/, updates plugins
```

### 4. Native runtime config
- **iOS**: open `ios/App/App.xcworkspace`, set signing team (Apple Developer account), display name, version, deep-link entitlements.
- **Android**: keystore + `signingConfig` in `android/app/build.gradle`. We build from CLI per the global Gradle setup (`./gradlew bundleRelease`).

### 5. One native capability for App Review
Apple rejects "thin web wrappers." We need at least one genuinely native feature. Easiest + most useful for Ruckus:
- **`@capacitor/push-notifications`** — book club activity, reading-streak nudges, friend finished a book.

Other low-effort options if push is too much for v1:
- `@capacitor/share` — share book / reading progress to other apps.
- `@capacitor/app` — handle deep links into book/club URLs natively.
- `@capacitor/haptics` — small but counts.

Recommend: ship with **share + deep links** for v1 (no backend work), add push in v1.1.

## Store Listings — Required Assets

Both stores will need:
- **Icon** (1024×1024 master — generates all sizes).
- **Splash screen** source (Capacitor's assets tool generates platform variants).
- **Screenshots** — at least one per device class (iPhone 6.7", iPhone 6.5", iPad 12.9"; Android phone + 7"/10" tablet).
- **Privacy policy URL** — mandatory both stores. Need to publish one at e.g. `ruckus.goodertechs.com/privacy`.
- **Description**: short tagline (~80 chars) + long description.
- **Content rating** (Google) / **Age rating** (Apple).
- **Data safety form** (Google) — declare what data we collect via Supabase auth + book/note storage.

## Per-Store Specifics

### Apple App Store
- $99/yr Apple Developer Program enrollment.
- Bundle ID: `app.goodertechs.ruckus` (must be unique across App Store).
- App Store Connect listing.
- TestFlight for beta before release.
- Review time: typically 24–48 hours, sometimes longer on first submission.
- Common rejection causes for our case: thin wrapper (mitigated by §5 above), missing privacy policy, in-app purchases done through web instead of StoreKit (N/A — we don't sell anything yet).

### Google Play Store
- $25 one-time Google Play Console fee.
- Package name: `app.goodertechs.ruckus`.
- Internal Testing → Closed Testing → Production rollout.
- Review time: hours for established accounts, can be a few days for first app.
- Build CLI from project root global instructions:
  ```bash
  cd android && ./gradlew bundleRelease
  ```
  Upload the resulting `.aab` to Play Console.

## Release Cadence

The web app stays on Cloudflare Pages and ships continuously. Native releases are batched — every store update goes through review, so we don't want to ship every commit.

**Rule of thumb:** push web-only fixes whenever; cut a native release when there's a meaningful new feature or every ~2 weeks, whichever comes first.

When the web build is sufficient to update the app's behavior (no new native plugin), the WebView picks up changes on next launch — no resubmission needed. Only when we add/upgrade a Capacitor plugin or change native config do we need a new store build.

## Decisions

- **Apple Developer enrollment**: starting on the existing **individual** account. Will transfer to GooderTechs (company) via Apple's App Transfer flow once the LLC + D-U-N-S are sorted. Reviews, ratings, downloads, and update path all carry over.
- **Bundle ID**: **`app.goodertechs.ruckus`** — registered now under the individual account so the eventual company transfer is friction-free. Bundle IDs are immutable; using the company namespace from day one avoids orphaning the app later.
- **Pricing**: free for v1. No StoreKit / Play Billing setup. Freemium subscriptions are on the roadmap once premium features actually exist.
- **Push notifications**: deferred to v1.1+. Not building APNs/FCM/Edge Function plumbing now.
- **Native capabilities for App Review** (covering the "thin wrapper" risk):
  - `@capacitor/share` — share book/note/club to other apps.
  - **Universal Links** — `https://ruckus.goodertechs.com/book/123` opens the installed app, not Safari. This is the single most reviewer-visible "real app" signal.
  - Service worker / offline support — meaningful for a reader, also reads as "uses platform capabilities."
  - `@capacitor/haptics` — small physical feedback on key actions.
  - Native splash + deliberate status-bar theming.

## Apple Transfer Mechanics (for reference, not now)
- Initiated by the sending (individual) account, accepted by the receiving (company) account.
- Both accounts must be active paid memberships at the time of transfer ($99 × 2 for the overlap window).
- App can't have any build in review or in TestFlight beta when the transfer is initiated.
- Push certs and provisioning profiles regenerate under the new account; the bundle ID stays.

## Milestones

1. **Scaffold** — PWA manifest, icons, Capacitor init, both platforms added. *(~1 day)*
2. **Local runs** — iOS Simulator and Android emulator running the wrapped app end-to-end. *(~1 day)*
3. **One native feature** — share + deep links wired up. *(~1 day)*
4. **Store-listing assets** — icons, screenshots, copy, privacy policy. *(~1 day, mostly non-code)*
5. **iOS first submission** — TestFlight build, then App Store Review. *(2–3 days incl. review)*
6. **Android first submission** — Internal Testing track, then Production. *(1–2 days incl. review)*

Total realistic time to first published release: **~2 weeks** assuming no review rejections.
