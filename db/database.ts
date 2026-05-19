import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, SCHEMA_VERSION } from './schema';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { generateId } from '../utils/finance';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('finance.db');
  await migrate(_db);
  return _db;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_TABLES_SQL);

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1'
  );

  const currentVersion = row?.version ?? 0;

  if (currentVersion < SCHEMA_VERSION) {
    await seedDefaultData(db);
    if (currentVersion === 0) {
      await db.runAsync('INSERT INTO schema_version (version) VALUES (?)', SCHEMA_VERSION);
    } else {
      await db.runAsync('UPDATE schema_version SET version = ?', SCHEMA_VERSION);
    }
  }
}

async function seedDefaultData(db: SQLite.SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories WHERE is_default = 1'
  );
  if ((existing?.count ?? 0) > 0) return;

  const now = new Date().toISOString();
  for (const cat of DEFAULT_CATEGORIES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (id, user_id, name, icon, color, type, budget_limit, is_default)
       VALUES (?, NULL, ?, ?, ?, ?, ?, 1)`,
      cat.id, cat.name, cat.icon, cat.color, cat.type, cat.budgetLimit ?? null
    );
  }

  // Create a default user if none exists
  const userExists = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM users'
  );
  if ((userExists?.count ?? 0) === 0) {
    await db.runAsync(
      `INSERT INTO users (id, name, currency, pin_hash, biometrics, theme, onboarding, created_at)
       VALUES (?, 'Me', 'USD', NULL, 0, 'system', 0, ?)`,
      generateId(), now
    );
  }
}
