import * as SQLite from 'expo-sqlite';
import { getDb } from '../database';
import { Category } from '../../types';
import { generateId } from '../../utils/finance';

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? null,
    name: row.name as string,
    icon: row.icon as string,
    color: row.color as string,
    type: row.type as Category['type'],
    budgetLimit: (row.budget_limit as number) ?? null,
    isDefault: Boolean(row.is_default),
  };
}

export async function getAllCategories(userId: string): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM categories WHERE is_default = 1 OR user_id = ? ORDER BY name ASC',
    userId
  );
  return rows.map(rowToCategory);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM categories WHERE id = ?',
    id
  );
  return row ? rowToCategory(row) : null;
}

export async function createCategory(
  data: Omit<Category, 'id' | 'isDefault'>
): Promise<Category> {
  const db = await getDb();
  const id = generateId();
  await db.runAsync(
    `INSERT INTO categories (id, user_id, name, icon, color, type, budget_limit, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    id, data.userId, data.name, data.icon, data.color, data.type,
    data.budgetLimit ?? null
  );
  return { ...data, id, isDefault: false };
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, 'id' | 'isDefault'>>
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: SQLite.SQLiteBindValue[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
  if (data.budgetLimit !== undefined) {
    fields.push('budget_limit = ?');
    values.push(data.budgetLimit);
  }
  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, ...values);
}

export async function setBudgetLimit(categoryId: string, limit: number | null): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE categories SET budget_limit = ? WHERE id = ?',
    limit ?? null, categoryId
  );
}
