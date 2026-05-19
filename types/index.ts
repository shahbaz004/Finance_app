// ─── Domain models ───────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'cash' | 'bank' | 'credit' | 'savings';
export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | null;
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  currency: string;
  pinHash: string | null;
  biometricsEnabled: boolean;
  theme: Theme;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
  budgetLimit: number | null;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  note: string | null;
  receiptUri: string | null;
  isRecurring: boolean;
  recurrenceRule: RecurrenceRule;
  toAccountId: string | null;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  linkedAccountId: string | null;
  icon: string;
  color: string;
  createdAt: string;
}

// ─── View models (joins) ──────────────────────────────────────────────────────

export interface TransactionWithDetails extends Transaction {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  accountName: string;
  toAccountName?: string;
}

export interface BudgetStatus {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  budgetLimit: number;
  spent: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
}

// ─── Filter / query types ─────────────────────────────────────────────────────

export interface TransactionFilter {
  search?: string;
  type?: TransactionType | 'all';
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

// ─── Chart data types ─────────────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expense: number;
  net: number;
}
