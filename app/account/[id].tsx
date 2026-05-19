import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useAccountStore } from '../../store/useAccountStore';
import { TransactionItem } from '../../components/transaction/TransactionItem';
import { getAllTransactions } from '../../db/queries/transactions';
import { getAccountById } from '../../db/queries/accounts';
import { Account, TransactionWithDetails } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { router } from 'expo-router';

export default function AccountDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const { accounts } = useAccountStore();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const currency = user?.currency ?? 'USD';

  useEffect(() => {
    (async () => {
      const acc = accounts.find((a) => a.id === id) ?? (await getAccountById(id));
      setAccount(acc);
      if (user?.id) {
        const txs = await getAllTransactions(user.id, { accountId: id });
        setTransactions(txs);
      }
      setLoading(false);
    })();
  }, [id, user?.id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!account) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Account not found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => (
        <TransactionItem transaction={item} onPress={() => router.push(`/transaction/${item.id}`)} />
      )}
      ListHeaderComponent={
        <View style={[styles.header, { backgroundColor: account.color }]}>
          <Text style={styles.accName}>{account.name}</Text>
          <Text style={styles.balance}>{formatCurrency(account.balance, currency)}</Text>
          <Text style={styles.type}>{account.type.toUpperCase()}</Text>
          <Text style={[styles.txCount, { color: 'rgba(255,255,255,0.7)' }]}>
            {transactions.length} transactions
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions</Text>
        </View>
      }
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  accName: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balance: { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 4 },
  type: { color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 0.5 },
  txCount: { marginTop: 8, fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15 },
});
