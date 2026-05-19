export const Colors = {
  light: {
    background: '#f8fafc',
    card: '#ffffff',
    cardSecondary: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    primary: '#4f46e5',
    primaryLight: '#eef2ff',
    income: '#16a34a',
    incomeLight: '#dcfce7',
    expense: '#dc2626',
    expenseLight: '#fee2e2',
    transfer: '#0284c7',
    tabBar: '#ffffff',
    tabBarActive: '#4f46e5',
    tabBarInactive: '#94a3b8',
    inputBackground: '#f1f5f9',
    shadow: 'rgba(0,0,0,0.08)',
    overlay: 'rgba(0,0,0,0.4)',
    safe: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
  },
  dark: {
    background: '#0f172a',
    card: '#1e293b',
    cardSecondary: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#334155',
    primary: '#6366f1',
    primaryLight: '#1e1b4b',
    income: '#22c55e',
    incomeLight: '#14532d',
    expense: '#f87171',
    expenseLight: '#450a0a',
    transfer: '#38bdf8',
    tabBar: '#1e293b',
    tabBarActive: '#6366f1',
    tabBarInactive: '#64748b',
    inputBackground: '#334155',
    shadow: 'rgba(0,0,0,0.3)',
    overlay: 'rgba(0,0,0,0.7)',
    safe: '#22c55e',
    warning: '#fbbf24',
    danger: '#f87171',
  },
} as const;

export type ColorScheme = typeof Colors.light;

export const ACCOUNT_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#d97706',
  '#16a34a', '#0284c7', '#0891b2', '#059669', '#65a30d',
];

export const GOAL_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#d97706',
  '#16a34a', '#0284c7', '#0891b2', '#f97316', '#14b8a6',
];
