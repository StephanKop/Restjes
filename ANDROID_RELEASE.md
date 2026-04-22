# Publishing Kliekjesclub to the Google Play Store

Step-by-step guide for shipping the Expo/React Native app at `apps/mobile` to Google Play. Commands assume you run them from `apps/mobile/` unless stated otherwise.

App identity (from `app.json`):
- **Package:** `nl.kliekjesclub.app`
- **App name:** Kliekjesclub
- **EAS project ID:** `9abc0f4d-43f4-4b56-9038-1cdbb086b857`
- **Owner:** `stephankop`

---

## 1. One-time prerequisites

### 1.1 Google Play Developer account
1. Go to https://play.google.com/console/signup
2. Sign in with the Google account that will own the app.
3. Pay the **$25 one-time** registration fee.
4. Fill in developer profile (name, contact email, address). Identity verification can take 1–3 days the first time.
5. If publishing as a business, complete the "Organization" verification (D-U-N-S number or similar).

### 1.2 Install / update tooling locally
```bash
# EAS CLI (build + submit)
pnpm add -g eas-cli

# Log in to Expo
eas login

# Verify you can see the project
cd apps/mobile
eas whoami
```

If you haven't linked the project to your Expo account yet:
```bash
eas init    # confirms projectId in app.json matches EAS
```

---

## 2. Create the app in Play Console

1. Open https://play.google.com/console → **Create app**
2. Fill in:
   - **App name:** Kliekjesclub
   - **Default language:** Nederlands (NL)
   - **App or game:** App
   - **Free or paid:** Free
3. Accept the declarations (COPPA, Play policies, export compliance).
4. Click **Create app**.
5. In the left sidebar, walk through **Dashboard → Set up your app**. This is a checklist Google requires before any release can go out. Key items:
   - Privacy policy URL (must be publicly reachable — we'll host one at e.g. `https://kliekjesclub.nl/privacy`)
   - App access (if some features are behind login, describe how reviewers can log in — create a test account)
   - Ads declaration (currently: no)
   - Content rating (fill in the questionnaire)
   - Target audience and content (13+ most likely)
   - News app: No
   - Data safety (declare what data Supabase stores: email, name, city, images, etc.)
   - Government app: No
   - Financial features: No
   - Health: No
   - Select app category: **Food & Drink**
   - Contact details (email, website, optional phone)
   - Store listing (see §5 below)

You can fill most of these in parallel with the build. None of them block the build itself — only the release submission.

---

## 3. Build a production AAB with EAS

Our `eas.json` already defines a `production` profile with `autoIncrement: true`, meaning EAS will bump the Android `versionCode` for every build automatically.

```bash
cd apps/mobile
eas build --profile production --platform android
```

First-time prompts:
- **Generate a new Android Keystore?** → Yes (EAS manages it for you; recommended unless you have a specific reason to bring your own). This is a one-time thing — subsequent builds reuse the same keystore. **Do not lose this keystore** — if you do, you can never update the app under the same package name. EAS keeps it for you; optionally download a backup with `eas credentials`.
- **Application ID:** `nl.kliekjesclub.app` (auto-detected from `app.json`)

The build runs in Expo's cloud (~15 minutes). When it finishes, you get a link to download an `.aab` (Android App Bundle — this is what Play Store wants, not an APK).

To keep a local copy:
```bash
eas build:list --platform android --limit 1
# then follow the "artifact" URL
```

---

## 4. Upload the first build to an Internal Testing track

**Always** ship to Internal Testing first — it's the fastest way to install a production-signed build on real devices and surface issues before a real release.

### Option A: Manual upload (simplest for the first build)
1. In Play Console → **Testing → Internal testing** → **Create new release**
2. Upload the `.aab` from the EAS build page.
3. Release name: auto-generated from `versionCode` is fine.
4. Release notes (per language): short changelog.
5. **Save → Review release → Start rollout to Internal testing**.
6. On the same page: **Testers** tab → create an email list with your own Gmail address + anyone else you want to test → save.
7. Grab the **opt-in URL** from the Testers tab, open it on your Android phone (signed into the tester Gmail), accept, then install from the Play Store.

### Option B: Automated submission via EAS Submit (recommended going forward)
Set up once, then every future build can be submitted with one command.

1. In Google Cloud Console, create a service account:
   - https://console.cloud.google.com/iam-admin/serviceaccounts
   - Create a new service account, download the JSON key.
2. In Play Console → **Users and permissions → Invite new users** → paste the service account email → grant **Admin (all apps)** or scoped permissions for this app (Release management + View app information).
3. Save the JSON key somewhere outside the repo (e.g. `~/.secrets/kliekjesclub-play.json`). **Never commit it.**
4. Update `apps/mobile/eas.json`:
   ```json
   "submit": {
     "production": {
       "android": {
         "serviceAccountKeyPath": "../../.secrets/kliekjesclub-play.json",
         "track": "internal"
       }
     }
   }
   ```
   (Adjust the path. EAS resolves it relative to `eas.json`.)
5. Submit:
   ```bash
   eas submit --profile production --platform android --latest
   ```

Going forward, the flow is: `eas build` → `eas submit` → promote inside Play Console.

---

## 5. Store listing content

In Play Console → **Grow → Store presence → Main store listing**:

- **App name:** Kliekjesclub (max 30 chars)
- **Short description:** 1 sentence, max 80 chars. Example: *"Deel je restjes en eet lekker voor minder, samen met je buurt."*
- **Full description:** up to 4000 chars, markdown not supported but line breaks OK.
- **App icon:** 512×512 PNG (we have `assets/images/icon.png` — make sure it's ≥512px)
- **Feature graphic:** 1024×500 PNG/JPG (required). This appears in the Play Store header.
- **Phone screenshots:** 2–8 screenshots, 16:9 or 9:16, between 320px and 3840px. Grab these from the Android emulator (Power → screenshot) or a real device.
- **Tablet screenshots:** optional but recommended for 7" and 10" if you support tablets.
- **Video:** optional YouTube URL.

Keep copies of these assets in `apps/mobile/assets/store/android/` so they're versioned.

---

## 6. Promote from Internal → Closed → Open → Production

Google's recommended progression:

1. **Internal testing** — you + team, no review delay, unlimited builds. Confirm the app works with a real production build + real keystore.
2. **Closed testing** — invite-only group (Google Group or email list) up to 100 people. **Required** for new accounts since Nov 2023: **12 testers minimum for 14 days** before you're allowed to publish to production. Skip this at your peril — it's enforced.
3. **Open testing** — anyone with the opt-in link. Optional.
4. **Production** — full public release.

Promote between tracks in Play Console → **Testing / Production → Promote release → pick target track**.

### The 14-day / 12-tester rule
For accounts created after Nov 13, 2023 (check your Play Console onboarding — if you registered recently, this applies):
- You must run a **Closed testing** track with ≥12 opted-in testers for ≥14 consecutive days before Google unlocks production.
- Get friends, early-beta users, or family to opt in via a Google Group.

---

## 7. Version management

`app.json`:
```json
"version": "1.0.0"
```
This is the user-visible `versionName`. Bump manually per release using semver (1.0.0 → 1.0.1 for fixes, 1.1.0 for features, 2.0.0 for breaking).

`android.versionCode` is **not set** in `app.json` — EAS manages it remotely because `eas.json` has `"appVersionSource": "remote"` and the production profile has `"autoIncrement": true`. This means every production build gets a new integer `versionCode`, which Google requires for updates.

Standard pre-release checklist:
1. Bump `version` in `app.json`.
2. Write release notes (you'll paste them into Play Console).
3. `eas build --profile production --platform android`
4. `eas submit --profile production --platform android --latest` (once §4 option B is set up)
5. Promote from Internal → Closed → Production in Play Console.

---

## 8. First-time review expectations

- First submission review: **1–7 days** (sometimes longer). Subsequent updates usually clear in hours–1 day.
- Common rejection causes for this kind of app:
  - Missing/inaccessible privacy policy URL.
  - Permissions requested but not explained (we use camera + photo library — the `expo-image-picker` plugin sets rationale strings already, so this should be fine).
  - Data safety form inaccurate (be honest about what Supabase stores).
  - No demo account for reviewers (create a test account with some dummy dishes/reservations and put its credentials in **App content → App access** in Play Console).

---

## 9. Post-launch

- Monitor **Crashes & ANRs** in Play Console → Quality → Android vitals.
- Set up Sentry or similar (optional) for JS-side crashes — React Native crashes on the JS bundle don't always surface natively.
- Enable **Managed Publishing** (Setup → Advanced settings) if you want to approve when a submitted release actually goes live, instead of it auto-rolling out after review.
- Use **Staged rollouts** (Production track → rollout percentage) to release to 5% / 20% / 50% / 100% of users and bail out if crashes spike.

---

## 10. Quick reference

```bash
# Build production AAB
eas build --profile production --platform android

# Submit latest build to Play Store (internal track by default)
eas submit --profile production --platform android --latest

# Check build status
eas build:list --platform android --limit 5

# Inspect / backup the managed Android keystore
eas credentials

# Preview a different release channel (e.g. internal testing build with dev client off)
eas build --profile preview --platform android
```

Useful links:
- Expo Android deploy docs: https://docs.expo.dev/submit/android/
- Play Console: https://play.google.com/console
- Play policies: https://play.google.com/about/developer-content-policy/
- Data safety form guide: https://support.google.com/googleplay/android-developer/answer/10787469
