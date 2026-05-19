import { create } from 'zustand';
import { Transaction, TransactionFilter, TransactionWithDetails } from '../types';
import {
  getAllTransactions,
  getRecentTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthSummary,
  getCategorySpending,
  getMonthlyReports,
} from '../db/queries/transactions';
import { useAccountStore } from './useAccountStore';

interface TransactionState {
  transactions: TransactionWithDetails[];
  recentTransactions: TransactionWithDetails[];
  monthSummary: { income: number; expense: number };
  categorySpending: { categoryId: string; total: number }[];
  monthlyReports: { month: string; income: number; expense: number }[];
  isLoading: boolean;
  filter: TransactionFilter;

  loadTransactions: (userId: string, filter?: TransactionFilter) => Promise<void>;
  loadRecent: (userId: string) => Promise<void>;
  loadMonthSummary: (userId: string, year: number, month: number) => Promise<void>;
  loadCategorySpending: (userId: string, year: number, month: number) => Promise<void>;
  loadMonthlyReports: (userId: string) => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>, userId: string) => Promise<void>;
  editTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>, userId: string) => Promise<void>;
  removeTransaction: (id: string, userId: string) => Promise<void>;
  setFilter: (filter: TransactionFilter) => void;
  resetFilter: () => void;
}

const DEFAULT_FILTER: TransactionFilter = {
  type: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  recentTransactions: [],
  monthSummary: { income: 0, expense: 0 },
  categorySpending: [],
  monthlyReports: [],
  isLoading: false,
  filter: DEFAULT_FILTER,

  loadTransactions: async (userId, filter) => {
    const activeFilter = filter ?? get().filter;
    set({ isLoading: true });
    try {
      const transactions = await getAllTransactions(userId, activeFilter);
      set({ transactions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadRecent: async (userId) => {
    const recentTransactions = await getRecentTransactions(userId, 5);
    set({ recentTransactions });
  },

  loadMonthSummary: async (userId, year, month) => {
    const monthSummary = await getMonthSummary(userId, year, month);
    set({ monthSummary });
  },

  loadCategorySpending: async (userId, year, month) => {
    const categorySpending = await getCategorySpending(userId, year, month);
    set({ categorySpending });
  },

  loadMonthlyReports: async (userId) => {
    const monthlyReports = await getMonthlyReports(userId, 12);
    set({ monthlyReports });
  },

  addTransaction: async (data, userId) => {
    await createTransaction(data);
    const now = new Date();
    await Promise.all([
      get().loadRecent(userId),
      get().loadMonthSummary(userId, now.getFullYear(), now.getMonth() + 1),
      get().loadCategorySpending(userId, now.getFullYear(), now.getMonth() + 1),
      get().loadTransactions(userId),
      useAccountStore.getState().loadAccounts(userId),
    ]);
  },

  editTransaction: async (id, data, userId) => {
    await updateTransaction(id, data);
    const now = new Date();
    await Promise.all([
      get().loadRecent(userId),
      get().loadMonthSummary(userId, now.getFullYear(), now.getMonth() + 1),
      get().loadCategorySpending(userId, now.getFullYear(), now.getMonth() + 1),
      get().loadTransactions(userId),
      useAccountStore.getState().loadAccounts(userId),
    ]);
  },

  removeTransaction: async (id, userId) => {
    // Optimistic removal
    set((s) => ({
      transactions: s.transactions.filter((t) => t.id !== id),
      recentTransactions: s.recentTransactions.filter((t) => t.id !== id),
    }));
    await deleteTransaction(id);
    const now = new Date();
    await Promise.all([
      get().loadMonthSummary(userId, now.getFullYear(), now.getMonth() + 1),
      get().loadCategorySpending(userId, now.getFullYear(), now.getMonth() + 1),
      useAccountStore.getState().loadAccounts(userId),
    ]);
  },

  setFilter: (filter) => set({ filter }),
  resetFilter: () => set({ filter: DEFAULT_FILTER }),
}));
