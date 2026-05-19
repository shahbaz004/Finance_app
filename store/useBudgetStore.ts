import { create } from 'zustand';
import { Category, BudgetStatus } from '../types';
import { getAllCategories, setBudgetLimit } from '../db/queries/categories';
import { getCategorySpending } from '../db/queries/transactions';
import { getBudgetStatus } from '../utils/finance';
import { scheduleBudgetWarning } from '../utils/notifications';

interface BudgetState {
  categories: Category[];
  budgetStatuses: BudgetStatus[];
  isLoading: boolean;

  loadBudget: (userId: string, year: number, month: number) => Promise<void>;
  updateBudgetLimit: (categoryId: string, limit: number | null, userId: string, year: number, month: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  categories: [],
  budgetStatuses: [],
  isLoading: false,

  loadBudget: async (userId, year, month) => {
    set({ isLoading: true });
    try {
      const [categories, spending] = await Promise.all([
        getAllCategories(userId),
        getCategorySpending(userId, year, month),
      ]);

      const spendingMap = new Map(spending.map((s) => [s.categoryId, s.total]));
      const expenseCategories = categories.filter(
        (c) => c.type === 'expense' || c.type === 'both'
      );

      const budgetStatuses: BudgetStatus[] = expenseCategories
        .filter((c) => c.budgetLimit !== null)
        .map((c) => {
          const spent = spendingMap.get(c.id) ?? 0;
          const percentage = (spent / c.budgetLimit!) * 100;
          return {
            categoryId: c.id,
            categoryName: c.name,
            categoryIcon: c.icon,
            categoryColor: c.color,
            budgetLimit: c.budgetLimit!,
            spent,
            percentage,
            status: getBudgetStatus(percentage),
          };
        });

      set({ categories, budgetStatuses, isLoading: false });

      // Fire notifications for over-budget categories
      for (const b of budgetStatuses) {
        if (b.percentage >= 80) {
          await scheduleBudgetWarning(b.categoryName, b.percentage);
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateBudgetLimit: async (categoryId, limit, userId, year, month) => {
    await setBudgetLimit(categoryId, limit);
    const { loadBudget } = useBudgetStore.getState();
    await loadBudget(userId, year, month);
  },
}));
