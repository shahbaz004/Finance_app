import { useEffect } from 'react';
import { getDb } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { useAccountStore } from '../store/useAccountStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useGoalStore } from '../store/useGoalStore';
import { useBudgetStore } from '../store/useBudgetStore';

export function useDatabase() {
  const { user, dbReady, setDbReady, loadUser } = useAppStore();

  useEffect(() => {
    (async () => {
      try {
        await getDb();
        setDbReady(true);
        await loadUser();
      } catch (e) {
        console.error('Database init failed:', e);
      }
    })();
  }, []);

  return { dbReady };
}

export function useInitialData() {
  const { user } = useAppStore();
  const { loadAccounts } = useAccountStore();
  const { loadRecent, loadMonthSummary, loadCategorySpending } = useTransactionStore();
  const { loadGoals } = useGoalStore();
  const { loadBudget } = useBudgetStore();

  useEffect(() => {
    if (!user?.id) return;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;

    Promise.all([
      loadAccounts(user.id),
      loadRecent(user.id),
      loadMonthSummary(user.id, y, m),
      loadCategorySpending(user.id, y, m),
      loadGoals(user.id),
      loadBudget(user.id, y, m),
    ]);
  }, [user?.id]);
}
