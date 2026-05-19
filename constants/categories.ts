import { Category } from '../types';

export const DEFAULT_CATEGORIES: Omit<Category, 'userId'>[] = [
  // Expense categories
  { id: 'cat_food', name: 'Food & Dining', icon: 'restaurant', color: '#f97316', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_transport', name: 'Transport', icon: 'car', color: '#3b82f6', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_shopping', name: 'Shopping', icon: 'bag', color: '#8b5cf6', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_health', name: 'Health', icon: 'medkit', color: '#ef4444', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'game-controller', color: '#ec4899', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_bills', name: 'Bills & Utilities', icon: 'flash', color: '#f59e0b', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_housing', name: 'Housing', icon: 'home', color: '#14b8a6', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_education', name: 'Education', icon: 'school', color: '#6366f1', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_travel', name: 'Travel', icon: 'airplane', color: '#0ea5e9', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_personal', name: 'Personal Care', icon: 'person', color: '#a855f7', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_gifts', name: 'Gifts', icon: 'gift', color: '#f43f5e', type: 'expense', budgetLimit: null, isDefault: true },
  { id: 'cat_other_exp', name: 'Other', icon: 'ellipsis-horizontal', color: '#6b7280', type: 'expense', budgetLimit: null, isDefault: true },
  // Income categories
  { id: 'cat_salary', name: 'Salary', icon: 'briefcase', color: '#22c55e', type: 'income', budgetLimit: null, isDefault: true },
  { id: 'cat_freelance', name: 'Freelance', icon: 'laptop', color: '#10b981', type: 'income', budgetLimit: null, isDefault: true },
  { id: 'cat_investment', name: 'Investment', icon: 'trending-up', color: '#16a34a', type: 'income', budgetLimit: null, isDefault: true },
  { id: 'cat_business', name: 'Business', icon: 'business', color: '#15803d', type: 'income', budgetLimit: null, isDefault: true },
  { id: 'cat_other_inc', name: 'Other Income', icon: 'cash', color: '#4ade80', type: 'income', budgetLimit: null, isDefault: true },
  // Transfer
  { id: 'cat_transfer', name: 'Transfer', icon: 'swap-horizontal', color: '#94a3b8', type: 'both', budgetLimit: null, isDefault: true },
];

export const EXPENSE_CATEGORIES = DEFAULT_CATEGORIES.filter(
  (c) => c.type === 'expense'
);

export const INCOME_CATEGORIES = DEFAULT_CATEGORIES.filter(
  (c) => c.type === 'income'
);
