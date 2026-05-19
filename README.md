# FinanceApp — Personal Finance Manager

A comprehensive, offline-first personal finance app built with **React Native + Expo**. Track income and expenses, manage budgets, monitor savings goals, and visualize financial health on iOS and Android.

---

## Features

| Area | Details |
|------|---------|
| **Onboarding** | Welcome slides, currency selection, name setup |
| **Home Dashboard** | Monthly balance card, spending donut chart, account carousel, recent transactions |
| **Transactions** | Full CRUD, search/filter/sort, recurring rules, receipt photos |
| **Budget Planner** | Per-category monthly limits, visual progress bars (safe/warning/exceeded), push notifications at 80% and 100% |
| **Accounts** | Cash, bank, credit, savings; per-account transaction history; color tags |
| **Goals** | Target amount, deadline, contribution tracking, confetti on completion |
| **Reports** | 12-month bar chart, net-flow line chart, category donut, CSV + HTML export |
| **Settings** | Currency, light/dark/system theme, PIN lock, Face ID/fingerprint |
| **Security** | 6-digit PIN (hashed in SecureStore), biometric unlock, auto-lock on app background |

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React Native 0.74 + Expo SDK 51 |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Database | expo-sqlite v14 (WAL mode, typed queries) |
| Charts | react-native-svg (custom DonutChart, BarChart, LineChart) |
| Animations | react-native-reanimated (ProgressBar), react-native-confetti-cannon (goals) |
| Notifications | expo-notifications |
| Auth | expo-local-authentication + expo-secure-store |
| Haptics | expo-haptics |
| OTA | expo-updates |

---

## Project Structure

```
finance-app/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout (SplashScreen, nav config)
│   ├── index.tsx               # Entry — redirects to onboarding / lock / tabs
│   ├── lock.tsx                # PIN / biometric lock screen
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── onboarding.tsx      # Welcome slides + currency/name setup
│   │   └── pin-setup.tsx       # 6-digit PIN creation
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Bottom tab navigator
│   │   ├── index.tsx           # Home Dashboard
│   │   ├── transactions.tsx    # Transaction list + search/filter
│   │   ├── budget.tsx          # Budget planner
│   │   ├── goals.tsx           # Savings goals
│   │   └── settings.tsx        # App settings
│   ├── transaction/
│   │   ├── add.tsx             # Add transaction sheet
│   │   └── [id].tsx            # Edit / delete transaction
│   ├── account/
│   │   ├── index.tsx           # Account list
│   │   └── [id].tsx            # Account detail (transaction history)
│   └── reports.tsx             # Reports & analytics
│
├── components/
│   ├── ui/                     # Button, Card, Input, Modal, FAB, ProgressBar, Badge
│   ├── charts/                 # DonutChart, BarChart, LineChart (react-native-svg)
│   ├── transaction/            # TransactionItem, TransactionForm
│   ├── account/                # AccountCard
│   ├── goal/                   # GoalCard
│   └── budget/                 # BudgetCard
│
├── store/                      # Zustand stores
│   ├── useAppStore.ts          # User + global state
│   ├── useTransactionStore.ts  # Transactions + month summary
│   ├── useAccountStore.ts      # Accounts
│   ├── useGoalStore.ts         # Goals
│   └── useBudgetStore.ts       # Budget statuses + category data
│
├── db/                         # SQLite layer
│   ├── database.ts             # openDatabaseAsync + migration runner
│   ├── schema.ts               # CREATE TABLE SQL + schema version
│   └── queries/
│       ├── users.ts
│       ├── accounts.ts
│       ├── transactions.ts
│       ├── categories.ts
│       └── goals.ts
│
├── hooks/
│   ├── useAuth.ts              # PIN + biometric helpers
│   ├── useDatabase.ts          # DB init + initial data loader
│   └── useTheme.ts             # Resolves light/dark colors
│
├── utils/
│   ├── finance.ts              # Financial math, PIN hashing, date helpers
│   ├── formatters.ts           # Currency, date, percentage formatting
│   ├── notifications.ts        # Budget alert notifications
│   └── export.ts               # CSV + HTML export
│
├── types/index.ts              # All TypeScript interfaces
├── constants/
│   ├── categories.ts           # 18 default categories with icons + colors
│   ├── colors.ts               # Light/dark color schemes
│   └── currencies.ts           # 20 supported currencies
│
└── __tests__/
    ├── finance.test.ts         # Unit tests for financial calculations
    └── formatters.test.ts      # Unit tests for formatting utilities
```

---

## SQLite Schema

```sql
-- Users (singleton row)
CREATE TABLE users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL DEFAULT 'Me',
  currency     TEXT NOT NULL DEFAULT 'USD',
  pin_hash     TEXT,
  biometrics   INTEGER NOT NULL DEFAULT 0,
  theme        TEXT NOT NULL DEFAULT 'system',
  onboarding   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL
);

-- Accounts (cash / bank / credit / savings)
CREATE TABLE accounts (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  name       TEXT NOT NULL,
  type       TEXT NOT NULL,   -- 'cash' | 'bank' | 'credit' | 'savings'
  balance    REAL NOT NULL DEFAULT 0,
  color      TEXT NOT NULL DEFAULT '#4f46e5',
  icon       TEXT NOT NULL DEFAULT 'wallet',
  created_at TEXT NOT NULL
);

-- Categories (18 built-in defaults + user-created)
CREATE TABLE categories (
  id           TEXT PRIMARY KEY,
  user_id      TEXT,           -- NULL = default category
  name         TEXT NOT NULL,
  icon         TEXT NOT NULL,
  color        TEXT NOT NULL,
  type         TEXT NOT NULL,  -- 'income' | 'expense' | 'both'
  budget_limit REAL,
  is_default   INTEGER NOT NULL DEFAULT 0
);

-- Transactions
CREATE TABLE transactions (
  id               TEXT PRIMARY KEY,
  account_id       TEXT NOT NULL REFERENCES accounts(id),
  category_id      TEXT NOT NULL REFERENCES categories(id),
  amount           REAL NOT NULL,
  type             TEXT NOT NULL,   -- 'income' | 'expense' | 'transfer'
  date             TEXT NOT NULL,   -- ISO date YYYY-MM-DD
  note             TEXT,
  receipt_uri      TEXT,
  is_recurring     INTEGER NOT NULL DEFAULT 0,
  recurrence_rule  TEXT,            -- 'daily' | 'weekly' | 'monthly' | NULL
  to_account_id    TEXT REFERENCES accounts(id),
  created_at       TEXT NOT NULL
);

-- Goals
CREATE TABLE goals (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users(id),
  title             TEXT NOT NULL,
  target_amount     REAL NOT NULL,
  current_amount    REAL NOT NULL DEFAULT 0,
  deadline          TEXT,
  linked_account_id TEXT REFERENCES accounts(id),
  icon              TEXT NOT NULL DEFAULT 'flag',
  color             TEXT NOT NULL DEFAULT '#4f46e5',
  created_at        TEXT NOT NULL
);

-- Migrations version tracker
CREATE TABLE schema_version (version INTEGER NOT NULL);
```

**Balance invariant:** `accounts.balance` is maintained atomically alongside every transaction write — income adds, expense subtracts, transfers debit source and credit destination.

---

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode 15+ with iOS Simulator or a physical device
- For Android: Android Studio with an AVD or a physical device with USB debugging

### Install

```bash
cd finance-app
npm install
```

### Run in development

```bash
# Start Expo dev server
npm start

# Or target a platform directly
npm run ios
npm run android
```

### Run tests

```bash
npm test
# or for CI
npm run test:ci
```

---

## Build for Production

### iOS

```bash
# Via EAS Build (recommended)
npx eas build --platform ios --profile production

# Or local build (requires Xcode)
npx expo run:ios --configuration Release
```

### Android

```bash
# Via EAS Build (recommended)
npx eas build --platform android --profile production

# Or local APK/AAB
npx expo run:android --variant release
```

### EAS Build Setup

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Configure: `eas build:configure`
4. Update `app.json` with your real bundle IDs and project ID

---

## OTA Updates

```bash
# Publish an update
npx eas update --branch production --message "Fix budget chart"
```

---

## Key Design Decisions

### Offline-first
All data lives in SQLite. There is no network dependency for core features. expo-sqlite v14 uses WAL mode for better read concurrency.

### Sensitive data
PIN hash is stored in `expo-secure-store` (Keychain on iOS, EncryptedSharedPreferences on Android), never in AsyncStorage.

### Optimistic UI
`removeTransaction` removes the row from Zustand state immediately before the async DB call resolves, so the UI feels instant.

### Balance integrity
Account balances are updated in the same async transaction write function as the transaction record — `createTransaction` calls `adjustBalance` before resolving, ensuring consistency without a separate reconciliation pass.

### Chart implementation
Charts are built with `react-native-svg` primitives (no third-party chart library dependency) to avoid version conflicts and keep bundle size lean.

---

## Environment Variables

None required for the default (SQLite-only) setup. If you add Supabase sync, create `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Adding a Custom Category

Navigate to **Budget → Set Budget**, tap a category → adjust limit. Custom categories can be added by calling `createCategory` from `db/queries/categories.ts` directly (a full category management UI is a straightforward extension).

---

## License

MIT
