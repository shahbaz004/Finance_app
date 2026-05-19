import { formatCurrency, formatDate, formatRelativeDate, formatPercentage, formatMonthShort } from '../utils/formatters';

describe('formatCurrency', () => {
  it('formats USD', () => {
    const result = formatCurrency(1234.56, 'USD');
    expect(result).toContain('1,234.56');
  });
  it('handles compact notation', () => {
    const result = formatCurrency(1_500_000, 'USD', { compact: true });
    expect(result).toBe('$1.5M');
  });
  it('handles compact K notation', () => {
    const result = formatCurrency(2500, 'USD', { compact: true });
    expect(result).toBe('$2.5K');
  });
  it('shows + sign for income', () => {
    const result = formatCurrency(100, 'USD', { showSign: true });
    expect(result).toContain('+');
  });
  it('shows - sign for expense', () => {
    const result = formatCurrency(-100, 'USD', { showSign: true });
    expect(result).toContain('-');
  });
});

describe('formatDate', () => {
  it('formats short date', () => {
    const result = formatDate('2024-06-15', 'short');
    expect(result).toContain('15');
    expect(result).toContain('Jun');
  });
});

describe('formatRelativeDate', () => {
  it('returns Today for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(formatRelativeDate(today)).toBe('Today');
  });
  it('returns Yesterday for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400_000).toISOString().split('T')[0];
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');
  });
});

describe('formatPercentage', () => {
  it('formats whole number', () => {
    expect(formatPercentage(75)).toBe('75%');
  });
  it('respects decimals param', () => {
    expect(formatPercentage(75.5, 1)).toBe('75.5%');
  });
});

describe('formatMonthShort', () => {
  it('formats YYYY-MM to short month', () => {
    const result = formatMonthShort('2024-06');
    expect(result).toBe('Jun');
  });
});
