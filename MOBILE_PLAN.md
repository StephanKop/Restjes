# Mobile App: Build & Deployment Plan

## Current Problem

The app cannot be installed on a physical iPhone because:

- **EAS cloud builds** require a paid Apple Developer account ($99/year)
- **Xcode sideloading** builds the native binary, but Expo native modules (like `ExponentImagePicker`) are not linked correctly when building manually through Xcode
- `npx expo run:ios --device` works but requires interactive terminal input

The core issue: **Expo's build tooling assumes either EAS (paid) or its own CLI (`expo run:ios`), and doesn't play well with manual Xcode builds.**

---

## Should We Switch Away from Expo?

### Short answer: No.

Expo is deeply integrated into this project. Migrating would cost weeks of work and the deployment problem would remain (Apple still requires a paid account or Xcode for device installs). Here's the breakdown:

### What Expo provides that would need replacement

| Feature | Expo Module | Community Alternative | Migration Effort |
|---|---|---|---|
| File-based routing (23 files) | expo-router | React Navigation | High |
| Push notifications | expo-notifications | react-native-push-notification | Medium |
| Image picker (4 screens) | expo-image-picker | react-native-image-picker | Low |
| OAuth / Google login | expo-auth-session + expo-web-browser | react-native-app-auth | Medium |
| Secure token storage | expo-secure-store | react-native-keychain | Low |
| Video playback (auth screens) | expo-av | react-native-video | Low |
| Device detection | expo-device | react-native-device-info | Low |
| Icons | @expo/vector-icons | react-native-vector-icons | Low |
| Build config / prebuild | app.json + eas.json | Manual native config | High |
| Metro / Babel presets | expo/metro-config + babel-preset-expo | Manual setup | Medium |

### Migration estimate: 4-6 weeks (full rewrite of navigation + native module wiring)

### What stays the same regardless

- NativeWind/Tailwind styling (framework-agnostic)
- Supabase backend (already abstracted)
- All business logic and UI components

### Why Expo is still the right choice

1. **The deployment problem is Apple's, not Expo's.** Bare React Native has the exact same issue: you need Xcode or a paid account to install on a device.
2. **expo-router gives you file-based routing** - switching to React Navigation means manually configuring every route.
3. **Expo SDK 54 is mature** - the native module linking issue is specifically a pnpm + manual Xcode build edge case.
4. **EAS Build is the intended path** and it works well once you have a developer account.

---

## Recommended Plan

### Phase 1: Get the app running on your phone (today)

**Option A: Use `expo run:ios` from your terminal (free, needs Xcode)**

Run this interactively (not from Claude Code):

```bash
cd apps/mobile && npx expo run:ios --device --configuration Release
```

This handles native module linking correctly, unlike manual Xcode builds. Select your iPhone when prompted. This is the quickest fix.

**Option B: Get an Apple Developer account ($99/year)**

This unlocks EAS cloud builds, TestFlight, and App Store distribution. For any app you plan to publish, this is unavoidable. With it:

```bash
cd apps/mobile && eas build --profile preview --platform ios
```

Builds in the cloud, sends you a download link. No Xcode needed.

### Phase 2: Clean up unused dependencies (30 min)

These packages are installed but never imported:

- `expo-crypto`
- `expo-font`
- `expo-linking`
- `expo-splash-screen`

Removing them reduces the native surface area and potential build issues.

### Phase 3: Set up proper build pipeline (once you have a developer account)

1. **Development build** - Install once, connect to dev server for fast iteration
   ```bash
   eas build --profile development --platform ios
   ```

2. **Preview builds** - Standalone app for testing without dev server
   ```bash
   eas build --profile preview --platform ios
   ```

3. **Production** - App Store submission
   ```bash
   eas build --profile production --platform ios
   eas submit --platform ios
   ```

### Phase 4: Improve the create dish screen resilience (optional)

Wrap the image picker import in a try/catch so the screen doesn't crash if the native module is unavailable. This makes the app more resilient in development/testing scenarios:

```tsx
// Lazy import with fallback
let ImagePicker: typeof import('expo-image-picker') | null = null
try {
  ImagePicker = require('expo-image-picker')
} catch {
  // Native module not available - disable image features
}
```

---

## Summary

| Action | Effort | Impact |
|---|---|---|
| Run `expo run:ios --device` from terminal | 10 min | Solves the immediate problem |
| Apple Developer account | $99 | Unlocks cloud builds, TestFlight, App Store |
| Remove unused Expo packages | 30 min | Cleaner builds |
| Migrate away from Expo | 4-6 weeks | No benefit for the current problem |

**Bottom line:** The issue is not Expo itself, it's the combination of pnpm monorepo + manual Xcode builds. Use Expo's own build tools (`expo run:ios` or EAS) and the problem goes away.
