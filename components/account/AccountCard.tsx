import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
}

const ACCOUNT_TYPE_ICONS: Record<Account['type'], string> = {
  cash: 'cash',
  bank: 'business',
  credit: 'card',
  savings: 'wallet',
};

export function AccountCard({ account, onPress }: AccountCardProps) {
  const { colors } = useTheme();
  const currency = useAppStore((s) => s.user?.currency ?? 'USD');

  const isNegative = account.balance < 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: account.color },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name={ACCOUNT_TYPE_ICONS[account.type] as any} size={20} color="#fff" />
        </View>
        <Text style={styles.type}>{account.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{account.name}</Text>
      <Text style={[styles.balance, isNegative && styles.negative]}>
        {formatCurrency(account.balance, currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 160,
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    marginRight: 6,
  },
  type: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  name: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  balance: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  negative: {
    color: '#fca5a5',
  },
});
