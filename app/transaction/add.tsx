import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { TransactionForm } from '../../components/transaction/TransactionForm';
import { Transaction } from '../../types';

export default function AddTransaction() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const { addTransaction } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { categories } = useBudgetStore();

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user?.id) return;
    await addTransaction(data, user.id);
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TransactionForm
        categories={categories}
        accounts={accounts}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
