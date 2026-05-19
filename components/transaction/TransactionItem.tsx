import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionWithDetails } from '../../types';
import { formatCurrency, formatRelativeDate } from '../../utils/formatters';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';

interface TransactionItemProps {
  transaction: TransactionWithDetails;
  onPress?: () => void;
  showAccount?: boolean;
}

export function TransactionItem({
  transaction: t,
  onPress,
  showAccount = false,
}: TransactionItemProps) {
  const { colors } = useTheme();
  const currency = useAppStore((s) => s.user?.currency ?? 'USD');

  const isIncome = t.type === 'income';
  const isTransfer = t.type === 'transfer';
  const amountColor = isIncome ? colors.income : isTransfer ? colors.transfer : colors.expense;
  const amountPrefix = isIncome ? '+' : isTransfer ? '' : '-';

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: t.categoryColor + '20' }]}>
        <Ionicons name={t.categoryIcon as any} size={20} color={t.categoryColor} />
      </View>
      <View style={styles.middle}>
        <Text style={[styles.category, { color: colors.text }]} numberOfLines={1}>
          {t.categoryName}
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={1}>
          {showAccount ? t.accountName : (t.note ?? formatRelativeDate(t.date))}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}{formatCurrency(t.amount, currency)}
        </Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {formatRelativeDate(t.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  middle: {
    flex: 1,
    marginRight: 8,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    marginTop: 2,
  },
});
