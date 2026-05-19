import * as SQLite from 'expo-sqlite';
import { getDb } from '../database';
import { Goal } from '../../types';
import { generateId } from '../../utils/finance';

function rowToGoal(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    targetAmount: row.target_amount as number,
    currentAmount: row.current_amount as number,
    deadline: (row.deadline as string) ?? null,
    linkedAccountId: (row.linked_account_id as string) ?? null,
    icon: row.icon as string,
    color: row.color as string,
    createdAt: row.created_at as string,
  };
}

export async function getAllGoals(userId: string): Promise<Goal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
    userId
  );
  return rows.map(rowToGoal);
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM goals WHERE id = ?', id
  );
  return row ? rowToGoal(row) : null;
}

export async function createGoal(data: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO goals (id, user_id, title, target_amount, current_amount, deadline,
                        linked_account_id, icon, color, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, data.userId, data.title, data.targetAmount, data.currentAmount,
    data.deadline ?? null, data.linkedAccountId ?? null,
    data.icon, data.color, now
  );
  return { ...data, id, createdAt: now };
}

export async function updateGoal(
  id: string,
  data: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: SQLite.SQLiteBindValue[] = [];
  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.targetAmount !== undefined) { fields.push('target_amount = ?'); values.push(data.targetAmount); }
  if (data.currentAmount !== undefined) { fields.push('current_amount = ?'); values.push(data.currentAmount); }
  if (data.deadline !== undefined) { fields.push('deadline = ?'); values.push(data.deadline); }
  if (data.linkedAccountId !== undefined) { fields.push('linked_account_id = ?'); values.push(data.linkedAccountId); }
  if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?`, ...values);
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM goals WHERE id = ?', id);
}

export async function addGoalContribution(id: string, amount: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE goals SET current_amount = MIN(current_amount + ?, target_amount) WHERE id = ?',
    amount, id
  );
}
