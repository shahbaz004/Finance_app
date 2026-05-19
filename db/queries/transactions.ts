import * as SQLite from 'expo-sqlite';
import { getDb } from '../database';
import { Transaction, TransactionType, TransactionWithDetails, TransactionFilter } from '../../types';
import { generateId } from '../../utils/finance';
import { adjustBalance } from './accounts';

function rowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    categoryId: row.category_id as string,
    amount: row.amount as number,
    type: row.type as TransactionType,
    date: row.date as string,
    note: (row.note as string) ?? null,
    receiptUri: (row.receipt_uri as string) ?? null,
    isRecurring: Boolean(row.is_recurring),
    recurrenceRule: (row.recurrence_rule as Transaction['recurrenceRule']) ?? null,
    toAccountId: (row.to_account_id as string) ?? null,
    createdAt: row.created_at as string,
  };
}

function rowToWithDetails(row: Record<string, unknown>): TransactionWithDetails {
  return {
    ...rowToTransaction(row),
    categoryName: row.category_name as string,
    categoryIcon: row.category_icon as string,
    categoryColor: row.category_color as string,
    accountName: row.account_name as string,
    toAccountName: (row.to_account_name as string) ?? undefined,
  };
}

const DETAILS_SELECT = `
  SELECT
    t.*,
    c.name  AS category_name,
    c.icon  AS category_icon,
    c.color AS category_color,
    a.name  AS account_name,
    ta.name AS to_account_name
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
  JOIN accounts   a ON a.id = t.account_id
  LEFT JOIN accounts ta ON ta.id = t.to_account_id
`;

export async function getAllTransactions(
  userId: string,
  filter: TransactionFilter = {}
): Promise<TransactionWithDetails[]> {
  const db = await getDb();
  const conditions: string[] = ['a.user_id = ?'];
  const params: SQLite.SQLiteBindValue[] = [userId];

  if (filter.type && filter.type !== 'all') {
    conditions.push('t.type = ?');
    params.push(filter.type);
  }
  if (filter.categoryId) {
    conditions.push('t.category_id = ?');
    params.push(filter.categoryId);
  }
  if (filter.accountId) {
    conditions.push('t.account_id = ?');
    params.push(filter.accountId);
  }
  if (filter.startDate) {
    conditions.push("t.date >= ?");
    params.push(filter.startDate);
  }
  if (filter.endDate) {
    conditions.push("t.date <= ?");
    params.push(filter.endDate);
  }
  if (filter.search) {
    conditions.push('(t.note LIKE ? OR c.name LIKE ? OR a.name LIKE ?)');
    const q = `%${filter.search}%`;
    params.push(q, q, q);
  }

  const orderCol = filter.sortBy === 'amount' ? 't.amount' : 't.date';
  const orderDir = filter.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await db.getAllAsync<Record<string, unknown>>(
    `${DETAILS_SELECT} ${where} ORDER BY ${orderCol} ${orderDir}`,
    ...params
  );
  return rows.map(rowToWithDetails);
}

export async function getRecentTransactions(
  userId: string,
  limit = 5
): Promise<TransactionWithDetails[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `${DETAILS_SELECT}
     WHERE a.user_id = ?
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ?`,
    userId, limit
  );
  return rows.map(rowToWithDetails);
}

export async function getTransactionById(id: string): Promise<TransactionWithDetails | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    `${DETAILS_SELECT} WHERE t.id = ?`,
    id
  );
  return row ? rowToWithDetails(row) : null;
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO transactions
       (id, account_id, category_id, amount, type, date, note, receipt_uri,
        is_recurring, recurrence_rule, to_account_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, data.accountId, data.categoryId, data.amount, data.type, data.date,
    data.note ?? null, data.receiptUri ?? null,
    data.isRecurring ? 1 : 0, data.recurrenceRule ?? null,
    data.toAccountId ?? null, now
  );

  // Update account balance
  if (data.type === 'income') {
    await adjustBalance(data.accountId, data.amount);
  } else if (data.type === 'expense') {
    await adjustBalance(data.accountId, -data.amount);
  } else if (data.type === 'transfer' && data.toAccountId) {
    await adjustBalance(data.accountId, -data.amount);
    await adjustBalance(data.toAccountId, data.amount);
  }

  return { ...data, id, createdAt: now };
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: SQLite.SQLiteBindValue[] = [];

  const fieldMap: Record<string, string> = {
    accountId: 'account_id', categoryId: 'category_id', amount: 'amount',
    type: 'type', date: 'date', note: 'note', receiptUri: 'receipt_uri',
    isRecurring: 'is_recurring', recurrenceRule: 'recurrence_rule',
    toAccountId: 'to_account_id',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in data) {
      fields.push(`${col} = ?`);
      const val = (data as Record<string, unknown>)[key];
      values.push(key === 'isRecurring' ? (val ? 1 : 0) : ((val as SQLite.SQLiteBindValue) ?? null));
    }
  }

  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, ...values);
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDb();
  const tx = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM transactions WHERE id = ?', id
  );
  if (!tx) return;

  // Reverse balance adjustment
  if (tx.type === 'income') {
    await adjustBalance(tx.account_id as string, -(tx.amount as number));
  } else if (tx.type === 'expense') {
    await adjustBalance(tx.account_id as string, tx.amount as number);
  } else if (tx.type === 'transfer' && tx.to_account_id) {
    await adjustBalance(tx.account_id as string, tx.amount as number);
    await adjustBalance(tx.to_account_id as string, -(tx.amount as number));
  }

  await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
}

export async function getMonthSummary(
  userId: string,
  year: number,
  month: number
): Promise<{ income: number; expense: number }> {
  const db = await getDb();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end   = `${year}-${String(month).padStart(2, '0')}-31`;

  const rows = await db.getAllAsync<{ type: string; total: number }>(
    `SELECT t.type, SUM(t.amount) as total
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = ? AND t.type IN ('income','expense')
       AND t.date BETWEEN ? AND ?
     GROUP BY t.type`,
    userId, start, end
  );

  let income = 0;
  let expense = 0;
  for (const row of rows) {
    if (row.type === 'income') income = row.total;
    else expense = row.total;
  }
  return { income, expense };
}

export async function getCategorySpending(
  userId: string,
  year: number,
  month: number
): Promise<{ categoryId: string; total: number }[]> {
  const db = await getDb();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end   = `${year}-${String(month).padStart(2, '0')}-31`;

  return db.getAllAsync<{ categoryId: string; total: number }>(
    `SELECT t.category_id as categoryId, SUM(t.amount) as total
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = ? AND t.type = 'expense'
       AND t.date BETWEEN ? AND ?
     GROUP BY t.category_id
     ORDER BY total DESC`,
    userId, start, end
  );
}

export async function getMonthlyReports(
  userId: string,
  months = 12
): Promise<{ month: string; income: number; expense: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ month: string; income: number; expense: number }>(
    `SELECT
       strftime('%Y-%m', t.date) as month,
       SUM(CASE WHEN t.type='income'  THEN t.amount ELSE 0 END) as income,
       SUM(CASE WHEN t.type='expense' THEN t.amount ELSE 0 END) as expense
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = ?
       AND t.type IN ('income','expense')
     GROUP BY month
     ORDER BY month DESC
     LIMIT ?`,
    userId, months
  );
}
