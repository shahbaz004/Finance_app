import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { TransactionItem } from '../../components/transaction/TransactionItem';
import { Input } from '../../components/ui/Input';
import { FAB } from '../../components/ui/FAB';
import { TransactionFilter, TransactionType } from '../../types';
import { formatRelativeDate } from '../../utils/formatters';

const TYPE_FILTERS: { label: string; value: TransactionFilter['type'] }[] = [
  { label: 'All', value: 'all' },
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
  { label: 'Transfer', value: 'transfer' },
];

export default function Transactions() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const { transactions, isLoading, filter, setFilter, loadTransactions } = useTransactionStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    const debounce = setTimeout(() => {
      const newFilter = { ...filter, search };
      setFilter(newFilter);
      loadTransactions(user.id, newFilter);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, user?.id]);

  const handleTypeFilter = useCallback((type: TransactionFilter['type']) => {
    if (!user?.id) return;
    const newFilter = { ...filter, type };
    setFilter(newFilter);
    loadTransactions(user.id, newFilter);
  }, [filter, user?.id]);

  const renderHeader = () => (
    <View>
      <Input
        value={search}
        onChangeText={setSearch}
        placeholder="Search transactions..."
        containerStyle={styles.searchBar}
        leftIcon={<Ionicons name="search" size={18} color={colors.textMuted} />}
        rightIcon={search ? <Ionicons name="close-circle" size={18} color={colors.textMuted} /> : undefined}
        onRightIconPress={() => setSearch('')}
      />
      <View style={styles.typeFilters}>
        {TYPE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.typeChip,
              {
                backgroundColor: filter.type === f.value ? colors.primary : colors.cardSecondary,
                borderColor: filter.type === f.value ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handleTypeFilter(f.value)}
          >
            <Text style={[styles.typeChipText, { color: filter.type === f.value ? '#fff' : colors.textSecondary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => router.push(`/transaction/${item.id}`)}
            showAccount
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transactions found
              </Text>
            </View>
          )
        }
        contentContainerStyle={[
          styles.list,
          { paddingTop: 16, paddingBottom: insets.bottom + 100 },
        ]}
        style={styles.flatList}
      />

      <FAB onPress={() => router.push('/transaction/add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
  },
  searchBar: {
    marginBottom: 12,
  },
  typeFilters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  center: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
