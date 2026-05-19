// SQLite schema — applied via migrations in database.ts

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL DEFAULT 'Me',
  currency     TEXT NOT NULL DEFAULT 'USD',
  pin_hash     TEXT,
  biometrics   INTEGER NOT NULL DEFAULT 0,
  theme        TEXT NOT NULL DEFAULT 'system',
  onboarding   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL,
  balance    REAL NOT NULL DEFAULT 0,
  color      TEXT NOT NULL DEFAULT '#4f46e5',
  icon       TEXT NOT NULL DEFAULT 'wallet',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS categories (
  id           TEXT PRIMARY KEY,
  user_id      TEXT,
  name         TEXT NOT NULL,
  icon         TEXT NOT NULL,
  color        TEXT NOT NULL,
  type         TEXT NOT NULL,
  budget_limit REAL,
  is_default   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id               TEXT PRIMARY KEY,
  account_id       TEXT NOT NULL,
  category_id      TEXT NOT NULL,
  amount           REAL NOT NULL,
  type             TEXT NOT NULL,
  date             TEXT NOT NULL,
  note             TEXT,
  receipt_uri      TEXT,
  is_recurring     INTEGER NOT NULL DEFAULT 0,
  recurrence_rule  TEXT,
  to_account_id    TEXT,
  created_at       TEXT NOT NULL,
  FOREIGN KEY (account_id)    REFERENCES accounts(id),
  FOREIGN KEY (category_id)   REFERENCES categories(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS goals (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL,
  title             TEXT NOT NULL,
  target_amount     REAL NOT NULL,
  current_amount    REAL NOT NULL DEFAULT 0,
  deadline          TEXT,
  linked_account_id TEXT,
  icon              TEXT NOT NULL DEFAULT 'flag',
  color             TEXT NOT NULL DEFAULT '#4f46e5',
  created_at        TEXT NOT NULL,
  FOREIGN KEY (user_id)           REFERENCES users(id),
  FOREIGN KEY (linked_account_id) REFERENCES accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_date        ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_account     ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category    ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type        ON transactions(type);
`;
