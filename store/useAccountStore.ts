import { create } from 'zustand';
import { Account } from '../types';
import {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../db/queries/accounts';

interface AccountState {
  accounts: Account[];
  isLoading: boolean;

  loadAccounts: (userId: string) => Promise<void>;
  addAccount: (data: Omit<Account, 'id' | 'createdAt'>) => Promise<Account>;
  editAccount: (id: string, data: Partial<Omit<Account, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  removeAccount: (id: string, userId: string) => Promise<void>;
  totalBalance: () => number;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  isLoading: false,

  loadAccounts: async (userId) => {
    set({ isLoading: true });
    try {
      const accounts = await getAllAccounts(userId);
      set({ accounts, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addAccount: async (data) => {
    const account = await createAccount(data);
    set((s) => ({ accounts: [...s.accounts, account] }));
    return account;
  },

  editAccount: async (id, data) => {
    await updateAccount(id, data);
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },

  removeAccount: async (id, userId) => {
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
    await deleteAccount(id);
  },

  totalBalance: () =>
    get().accounts.reduce((sum, a) => sum + a.balance, 0),
}));
