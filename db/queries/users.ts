import * as SQLite from 'expo-sqlite';
import { getDb } from '../database';
import { User, Theme } from '../../types';

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    currency: row.currency as string,
    pinHash: (row.pin_hash as string) ?? null,
    biometricsEnabled: Boolean(row.biometrics),
    theme: row.theme as Theme,
    onboardingComplete: Boolean(row.onboarding),
    createdAt: row.created_at as string,
  };
}

export async function getUser(): Promise<User | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM users LIMIT 1'
  );
  return row ? rowToUser(row) : null;
}

export async function updateUser(data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: SQLite.SQLiteBindValue[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.currency !== undefined) { fields.push('currency = ?'); values.push(data.currency); }
  if (data.pinHash !== undefined) { fields.push('pin_hash = ?'); values.push(data.pinHash); }
  if (data.biometricsEnabled !== undefined) { fields.push('biometrics = ?'); values.push(data.biometricsEnabled ? 1 : 0); }
  if (data.theme !== undefined) { fields.push('theme = ?'); values.push(data.theme); }
  if (data.onboardingComplete !== undefined) { fields.push('onboarding = ?'); values.push(data.onboardingComplete ? 1 : 0); }
  if (fields.length === 0) return;
  await db.runAsync(`UPDATE users SET ${fields.join(', ')}`, ...values);
}
