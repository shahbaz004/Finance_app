import { Transaction } from '../types';

// ─── ID generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Financial calculations ───────────────────────────────────────────────────

export function calcNetWorth(accounts: { balance: number }[]): number {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

export function calcTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calcTotalExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calcSavingsRate(income: number, expense: number): number {
  if (income === 0) return 0;
  return Math.max(0, ((income - expense) / income) * 100);
}

export function calcBudgetPercentage(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min((spent / limit) * 100, 100);
}

export function getBudgetStatus(
  percentage: number
): 'safe' | 'warning' | 'exceeded' {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 80) return 'warning';
  return 'safe';
}

export function calcGoalProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}

export function daysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function requiredMonthlySaving(
  remaining: number,
  deadline: string | null
): number | null {
  const days = daysUntilDeadline(deadline);
  if (days === null || days <= 0) return null;
  const months = days / 30;
  return remaining / months;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function startOfMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

export function endOfMonth(date = new Date()): string {
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
}

export function isoDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// ─── PIN hashing (simple, non-crypto — use expo-crypto for production) ────────

export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}
