import { getCurrency } from '../constants/currencies';

export function formatCurrency(
  amount: number,
  currencyCode = 'USD',
  opts: { showSign?: boolean; compact?: boolean } = {}
): string {
  const currency = getCurrency(currencyCode);
  const absAmount = Math.abs(amount);

  let formatted: string;
  if (opts.compact && absAmount >= 1_000_000) {
    formatted = `${currency.symbol}${(absAmount / 1_000_000).toFixed(1)}M`;
  } else if (opts.compact && absAmount >= 1_000) {
    formatted = `${currency.symbol}${(absAmount / 1_000).toFixed(1)}K`;
  } else {
    try {
      formatted = new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(absAmount);
    } catch {
      formatted = `${currency.symbol}${absAmount.toFixed(2)}`;
    }
  }

  if (opts.showSign) {
    return amount < 0 ? `-${formatted}` : `+${formatted}`;
  }
  return formatted;
}

export function formatDate(dateStr: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  const opts: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' },
  }[format] as Intl.DateTimeFormatOptions;
  return date.toLocaleDateString(undefined, opts);
}

export function formatMonthYear(dateStr: string): string {
  // Handles 'YYYY-MM' format from GROUP BY queries
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatMonthShort(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1).toLocaleDateString(undefined, {
    month: 'short',
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr, 'short');
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)}%`;
}
