import * as SQLite from 'expo-sqlite';
import { getDb } from '../database';
import { Account, AccountType } from '../../types';
import { generateId } from '../../utils/finance';

function rowToAccount(row: Record<string, unknown>): Account {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    type: row.type as AccountType,
    balance: row.balance as number,
    color: row.color as string,
    icon: row.icon as string,
    createdAt: row.created_at as string,
  };
}

export async function getAllAccounts(userId: string): Promise<Account[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC',
    userId
  );
  return rows.map(rowToAccount);
}

export async function getAccountById(id: string): Promise<Account | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM accounts WHERE id = ?',
    id
  );
  return row ? rowToAccount(row) : null;
}

export async function createAccount(
  data: Omit<Account, 'id' | 'createdAt'>
): Promise<Account> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO accounts (id, user_id, name, type, balance, color, icon, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id, data.userId, data.name, data.type, data.balance, data.color, data.icon, now
  );
  return { ...data, id, createdAt: now };
}

export async function updateAccount(
  id: string,
  data: Partial<Omit<Account, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: SQLite.SQLiteBindValue[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
  if (data.balance !== undefined) { fields.push('balance = ?'); values.push(data.balance); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
  if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, ...values);
}

export async function deleteAccount(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM accounts WHERE id = ?', id);
}

export async function adjustBalance(id: string, delta: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE accounts SET balance = balance + ? WHERE id = ?', delta, id);
}
