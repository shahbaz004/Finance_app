import {
  calcNetWorth,
  calcTotalIncome,
  calcTotalExpense,
  calcSavingsRate,
  calcBudgetPercentage,
  getBudgetStatus,
  calcGoalProgress,
  daysUntilDeadline,
  requiredMonthlySaving,
  hashPin,
  verifyPin,
  startOfMonth,
  endOfMonth,
  isoDateString,
} from '../utils/finance';
import { Transaction } from '../types';

// ─── calcNetWorth ─────────────────────────────────────────────────────────────

describe('calcNetWorth', () => {
  it('sums balances', () => {
    expect(calcNetWorth([{ balance: 100 }, { balance: 200 }, { balance: -50 }])).toBe(250);
  });
  it('returns 0 for empty', () => {
    expect(calcNetWorth([])).toBe(0);
  });
  it('handles negative-only accounts', () => {
    expect(calcNetWorth([{ balance: -100 }, { balance: -50 }])).toBe(-150);
  });
});

// ─── calcTotalIncome / calcTotalExpense ───────────────────────────────────────

const makeTx = (type: Transaction['type'], amount: number): Transaction => ({
  id: '1',
  accountId: 'a',
  categoryId: 'c',
  amount,
  type,
  date: '2024-01-01',
  note: null,
  receiptUri: null,
  isRecurring: false,
  recurrenceRule: null,
  toAccountId: null,
  createdAt: '2024-01-01T00:00:00Z',
});

describe('calcTotalIncome', () => {
  it('sums only income transactions', () => {
    const txs = [makeTx('income', 500), makeTx('expense', 200), makeTx('income', 300)];
    expect(calcTotalIncome(txs)).toBe(800);
  });
  it('returns 0 when no income', () => {
    expect(calcTotalIncome([makeTx('expense', 100)])).toBe(0);
  });
});

describe('calcTotalExpense', () => {
  it('sums only expense transactions', () => {
    const txs = [makeTx('expense', 100), makeTx('income', 500), makeTx('expense', 50)];
    expect(calcTotalExpense(txs)).toBe(150);
  });
});

// ─── calcSavingsRate ──────────────────────────────────────────────────────────

describe('calcSavingsRate', () => {
  it('calculates correct percentage', () => {
    expect(calcSavingsRate(1000, 600)).toBe(40);
  });
  it('returns 0 when income is 0', () => {
    expect(calcSavingsRate(0, 100)).toBe(0);
  });
  it('clamps to 0 when expense > income', () => {
    expect(calcSavingsRate(100, 200)).toBe(0);
  });
  it('returns 100 when expense is 0', () => {
    expect(calcSavingsRate(1000, 0)).toBe(100);
  });
});

// ─── calcBudgetPercentage ─────────────────────────────────────────────────────

describe('calcBudgetPercentage', () => {
  it('calculates correctly', () => {
    expect(calcBudgetPercentage(80, 100)).toBe(80);
  });
  it('caps at 100 when over budget', () => {
    expect(calcBudgetPercentage(150, 100)).toBe(100);
  });
  it('returns 0 for zero limit', () => {
    expect(calcBudgetPercentage(50, 0)).toBe(0);
  });
});

// ─── getBudgetStatus ──────────────────────────────────────────────────────────

describe('getBudgetStatus', () => {
  it('returns safe below 80%', () => expect(getBudgetStatus(50)).toBe('safe'));
  it('returns warning at 80%', () => expect(getBudgetStatus(80)).toBe('warning'));
  it('returns warning at 95%', () => expect(getBudgetStatus(95)).toBe('warning'));
  it('returns exceeded at 100%', () => expect(getBudgetStatus(100)).toBe('exceeded'));
  it('returns exceeded above 100%', () => expect(getBudgetStatus(110)).toBe('exceeded'));
});

// ─── calcGoalProgress ────────────────────────────────────────────────────────

describe('calcGoalProgress', () => {
  it('calculates correctly', () => {
    expect(calcGoalProgress(250, 500)).toBe(50);
  });
  it('caps at 100', () => {
    expect(calcGoalProgress(600, 500)).toBe(100);
  });
  it('returns 0 for zero target', () => {
    expect(calcGoalProgress(100, 0)).toBe(0);
  });
});

// ─── daysUntilDeadline ───────────────────────────────────────────────────────

describe('daysUntilDeadline', () => {
  it('returns null for null deadline', () => {
    expect(daysUntilDeadline(null)).toBeNull();
  });
  it('returns positive days for future date', () => {
    const future = new Date(Date.now() + 10 * 86400 * 1000).toISOString().split('T')[0];
    expect(daysUntilDeadline(future)).toBeGreaterThan(0);
  });
  it('returns 0 or negative for past date', () => {
    const past = '2020-01-01';
    expect(daysUntilDeadline(past)).toBeLessThanOrEqual(0);
  });
});

// ─── requiredMonthlySaving ───────────────────────────────────────────────────

describe('requiredMonthlySaving', () => {
  it('returns null for null deadline', () => {
    expect(requiredMonthlySaving(1000, null)).toBeNull();
  });
  it('returns null for past deadline', () => {
    expect(requiredMonthlySaving(1000, '2020-01-01')).toBeNull();
  });
  it('returns a positive value for future deadline', () => {
    const future = new Date(Date.now() + 90 * 86400 * 1000).toISOString().split('T')[0];
    const result = requiredMonthlySaving(900, future);
    expect(result).toBeGreaterThan(0);
  });
});

// ─── PIN hashing ──────────────────────────────────────────────────────────────

describe('hashPin / verifyPin', () => {
  it('produces consistent hash', () => {
    expect(hashPin('123456')).toBe(hashPin('123456'));
  });
  it('different pins have different hashes', () => {
    expect(hashPin('123456')).not.toBe(hashPin('654321'));
  });
  it('verifyPin returns true for matching pin', () => {
    const hash = hashPin('999888');
    expect(verifyPin('999888', hash)).toBe(true);
  });
  it('verifyPin returns false for wrong pin', () => {
    const hash = hashPin('999888');
    expect(verifyPin('111111', hash)).toBe(false);
  });
});

// ─── Date helpers ─────────────────────────────────────────────────────────────

describe('startOfMonth', () => {
  it('returns first day of month', () => {
    const d = new Date(2024, 5, 15); // June 15
    expect(startOfMonth(d)).toBe('2024-06-01');
  });
});

describe('endOfMonth', () => {
  it('returns last day of February (non-leap)', () => {
    expect(endOfMonth(new Date(2023, 1, 1))).toBe('2023-02-28');
  });
  it('returns last day of February (leap year)', () => {
    expect(endOfMonth(new Date(2024, 1, 1))).toBe('2024-02-29');
  });
  it('returns last day of a 31-day month', () => {
    expect(endOfMonth(new Date(2024, 0, 1))).toBe('2024-01-31');
  });
});

describe('isoDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = isoDateString(new Date(2024, 5, 15));
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe('2024-06-15');
  });
});
