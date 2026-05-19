import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BudgetStatus } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../ui/ProgressBar';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';

interface BudgetCardProps {
  budget: BudgetStatus;
}

export function BudgetCard({ budget: b }: BudgetCardProps) {
  const { colors } = useTheme();
  const currency = useAppStore((s) => s.user?.currency ?? 'USD');

  const statusColor =
    b.status === 'exceeded'
      ? colors.danger
      : b.status === 'warning'
      ? colors.warning
      : colors.safe;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: b.categoryColor + '18' }]}>
          <Ionicons name={b.categoryIcon as any} size={20} color={b.categoryColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{b.categoryName}</Text>
          <Text style={[styles.amounts, { color: colors.textSecondary }]}>
            {formatCurrency(b.spent, currency)} / {formatCurrency(b.budgetLimit, currency)}
          </Text>
        </View>
        <Text style={[styles.pct, { color: statusColor }]}>
          {formatPercentage(b.percentage)}
        </Text>
      </View>
      <ProgressBar
        percentage={b.percentage}
        height={7}
        status={b.status}
        trackColor={colors.cardSecondary}
      />
      {b.status !== 'safe' && (
        <View style={styles.alert}>
          <Ionicons
            name={b.status === 'exceeded' ? 'alert-circle' : 'warning'}
            size={13}
            color={statusColor}
          />
          <Text style={[styles.alertText, { color: statusColor }]}>
            {b.status === 'exceeded'
              ? `Over by ${formatCurrency(b.spent - b.budgetLimit, currency)}`
              : `${formatCurrency(b.budgetLimit - b.spent, currency)} remaining`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  amounts: {
    fontSize: 12,
    marginTop: 2,
  },
  pct: {
    fontSize: 14,
    fontWeight: '700',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
