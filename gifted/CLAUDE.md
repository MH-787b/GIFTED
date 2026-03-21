# Gifted — Gift Tracking App

## What it is
A mobile app where users track gifts given and received with friends/family.
Core features: contacts list, birthday reminders, gift log, balance score.

## Tech stack
- React Native + Expo (SDK 55, managed workflow)
- Expo Router v55 (file-based routing with tab layout)
- Supabase (auth + database — not yet integrated)
- Stripe (payments, later)
- TypeScript

## Repo structure (top-level)
```
Gift_tracker/
├── gifted/          — Expo React Native app (the main app)
├── docs/            — Static landing page for GitHub Pages (APK download site)
│   ├── index.html   — Hero page with download button
│   ├── icon.png     — App icon used on the landing page
│   └── gifted.apk   — (place built APK here for download)
└── NOTES            — Dev notes (run commands, build decisions)
```

## App structure (`gifted/`)
- `app/_layout.tsx` — Root layout with Stack navigator, theme provider, font loading, AuthProvider, auth-based routing
- `app/sign-in.tsx` — Sign-in screen (name + email, local auth via AsyncStorage)
- `app/(tabs)/_layout.tsx` — Tab navigator with 4 tabs (Dashboard, People, Gifts, Ideas)
- `app/(tabs)/index.tsx` — Dashboard screen (personalised welcome, stat cards, upcoming section, sign-out button)
- `app/(tabs)/people.tsx` — People screen (empty state with "Add Person" button, add flow not yet implemented)
- `app/(tabs)/gifts.tsx` — Gifts screen (add/view/remove gifts with price, person, direction)
- `app/(tabs)/ideas.tsx` — Ideas screen (add/view/edit/remove gift ideas with person and notes)
- `constants/Colors.ts` — Theme colours (light + dark mode)
- `components/Themed.tsx` — Theme-aware Text/View wrappers
- `components/useColorScheme.ts` — Color scheme hook
- `contexts/AuthContext.tsx` — Auth state provider (user object, signIn/signOut, AsyncStorage-backed)

## Key requirements
- Must remain iOS and Android compatible at all times. No platform-specific code.
- Always use Expo managed workflow — never eject.
- No Android-only or iOS-only libraries.

## Design system
- Coral accent colour: `#D85A30`
- Warm white background: `#faf8f5`
- Card background: `#ffffff` (light), `#2c2420` (dark)
- Rounded cards: borderRadius 16, subtle shadow (opacity 0.06)
- Dark mode supported via `useColorScheme` hook
- Tab icons use `expo-symbols` (cross-platform SF Symbols / Material Icons)
- Friendly, clean aesthetic

## Features implemented
- **Authentication** — Local sign-in with name and email (AsyncStorage-backed, no password/server validation yet). Users see a sign-in screen on first launch. Auth state persists across restarts. Sign-out available on Dashboard. Replace with Supabase auth when backend is integrated.
- **Gift tracking** — Users can add and edit gifts via a slide-up modal with:
  - Gift name (what it was)
  - Person (from/to — label changes based on direction)
  - Price ($0–1,500) via draggable slider, +/− buttons, or direct numeric input
  - Direction toggle (given / received)
  - Prominent "Save Gift" / "Update Gift" button below the price slider
  - Gifts persist locally via AsyncStorage and survive app restarts
  - Each gift card shows coral-accented price and a direction badge
  - Tapping a gift card opens the modal pre-filled for editing
  - Gifts can be removed individually
- **Gift ideas** — Users can save gift ideas via a slide-up modal with:
  - Idea title (required)
  - Person — who it's for (optional)
  - Friends — add multiple friends via text input + "Add" button, shown as removable coral chips
  - Notes — freeform text (optional)
  - Prominent "Save Idea" / "Update Idea" button at the bottom
  - Ideas persist locally via AsyncStorage
  - Idea cards show all associated people (person + friends) in the "For" line
  - Tapping an idea card opens the modal pre-filled for editing
  - Ideas can be removed individually

## Dependencies beyond Expo defaults
- `@react-native-async-storage/async-storage` — local data persistence for gifts and ideas
- `react-native-gesture-handler` — pan gesture for draggable price slider

## Important notes
- **State management** — Currently using React `useState` + AsyncStorage (no global state library). When Supabase is integrated, AsyncStorage should be replaced with Supabase queries.
- **Price slider** — Custom-built using `react-native-gesture-handler` (Pan gesture) + `react-native-reanimated` (animated styles). The `PriceSlider` component lives inside `gifts.tsx` — extract to `components/` if reused elsewhere.
- **GestureHandlerRootView** — The Gifts screen wraps its root in `GestureHandlerRootView` (required by gesture handler). If gestures are added to other screens, consider moving this to `app/_layout.tsx` instead.
- **Gift IDs** — Currently using `Date.now().toString()`. Replace with UUIDs or server-generated IDs when adding a backend.
- **No confirmation on delete** — `Remove` button deletes immediately with no undo. Consider adding confirmation or undo-toast before shipping.
- **Edit flow** — Tapping a gift card opens the same modal in edit mode (title says "Edit Gift", button says "Update Gift"). The gift's existing values are pre-filled. Editing updates the gift in-place without changing its ID or createdAt timestamp.

## EAS Build & APK
- EAS project ID: `b01fa9f1-e933-4c5f-a4ca-b23b468d0809`
- Expo owner: `m4x_99`
- Android package: `com.gifted.app`
- `eas.json` has a `preview` profile configured with `"buildType": "apk"` for installable APKs
- Build command: `cd gifted && eas build --platform android --profile preview`
- The built APK should be placed in `docs/gifted.apk` for download via the landing page

## Landing page (docs/)
- Static HTML hero page hosted via GitHub Pages (free)
- Matches the app's design system (coral `#D85A30`, warm white `#faf8f5`, rounded cards)
- Shows app icon, tagline, 3 feature cards, and a prominent APK download button
- Mobile-responsive
- **Deployment**: GitHub repo Settings → Pages → Source: branch `main`, folder `/docs`
- Download button links to `gifted.apk` (relative path — file must be in `docs/`)

## Running locally
```bash
cd gifted
npx expo start          # Start dev server (scan QR with Expo Go)
npx expo start --web    # Run in browser
```

## Git
- Not yet initialised as a git repo (as of March 2026)
- Plan: push to GitHub, enable GitHub Pages on `/docs` for the landing page