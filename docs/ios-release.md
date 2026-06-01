# iOS Release Runbook

How to cut and upload a new iOS build of Ruckus to App Store Connect.

App identity:
- **Bundle ID**: `app.goodertechs.ruckus`
- **Team ID**: `A235BNZWJ5` (individual Apple Developer account)
- **Apple ID for upload**: `gcarey.tech@gmail.com`
- **Signing**: automatic (Xcode manages the distribution cert + provisioning profile)

> For strategy/context (Capacitor, store listings, transfer plan) see [app-store-plan.md](app-store-plan.md). This doc is just the mechanical release steps.

---

## Before every release

Bump the build number so App Store Connect accepts the upload (a version can't be re-uploaded with the same build number):

- `ios/App/App.xcodeproj/project.pbxproj` → `CURRENT_PROJECT_VERSION` (both Debug & Release configs)
- Keep it in sync with Android's `versionCode` in `android/app/build.gradle` if cutting both.

Then refresh the web build into the native shell:

```bash
npm run build        # produces dist/
npx cap sync ios     # copies dist/ into ios/ and updates plugins
```

---

## Step 1 — Archive + export the `.ipa`

Two interchangeable ways. Both write `build/export/App.ipa`.

### Option A — Xcode GUI (what was used for the v2/v3 builds)
1. `open ios/App/App.xcworkspace`
2. Set the run destination to **Any iOS Device (arm64)**.
3. **Product → Archive**.
4. In the Organizer that opens: **Distribute App → App Store Connect → Export** (not "Upload" — we upload separately with altool).
5. Choose the export location → produces `build/export/App.ipa`.

### Option B — pure CLI (no Xcode GUI needed)
```bash
# Archive
xcodebuild -workspace ios/App/App.xcworkspace -scheme App \
  -configuration Release -archivePath build/App.xcarchive archive

# Export .ipa using the committed options plist
xcodebuild -exportArchive -archivePath build/App.xcarchive \
  -exportPath build/export -exportOptionsPlist build/ExportOptions.plist
```

`build/ExportOptions.plist` (committed) pins: `method=app-store-connect`, `signingStyle=automatic`, `teamID=A235BNZWJ5`.

---

## Step 2 — Upload to App Store Connect

```bash
./build/upload.sh
```

`upload.sh` runs `xcrun altool --upload-app` against `build/export/App.ipa` and **prompts for an app-specific password** (it is not stored anywhere).

---

## Credentials needed on a fresh machine

Neither of these lives in the repo — set them up before releasing from a new machine:

1. **Apple ID signed into Xcode** — Xcode → Settings → Accounts → add the Apple Developer account (team `A235BNZWJ5`). With automatic signing, Xcode downloads/creates the distribution cert + profile on first archive. Required for Option A *and* Option B.
2. **App-specific password** for the altool upload. Generated at <https://appleid.apple.com> → Sign-In & Security → App-Specific Passwords. **Cannot be retrieved after creation** — if it isn't saved in a password manager, revoke the old one and generate a new one. Enter it when `upload.sh` prompts.

---

## Build artifacts & git

`build/App.xcarchive/` and `build/export/` are gitignored (large, regenerated each release). Only `build/ExportOptions.plist` and `build/upload.sh` are tracked.

---

## After upload

- Processing in App Store Connect takes a few minutes before the build shows up.
- TestFlight can pick it up automatically; for App Store release, attach the build to a version and submit for review.
- Remember the web app ships continuously on Cloudflare Pages — only cut a native build when native config/plugins change or per the ~2-week cadence in the plan doc.
