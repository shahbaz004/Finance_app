import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useAccountStore } from '../../store/useAccountStore';
import { TransactionItem } from '../../components/transaction/TransactionItem';
import { AccountCard } from '../../components/account/AccountCard';
import { DonutChart } from '../../components/charts/DonutChart';
import { FAB } from '../../components/ui/FAB';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { DEFAULT_CATEGORIES } from '../../constants/categories';

export default function Home() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const { monthSummary, recentTransactions, categorySpending } = useTransactionStore();
  const { accounts } = useAccountStore();

  const currency = user?.currency ?? 'USD';
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const now = new Date();
  const monthLabel = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const donutData = useMemo(
    () =>
      categorySpending.slice(0, 6).map((s) => {
        const cat = DEFAULT_CATEGORIES.find((c) => c.id === s.categoryId);
        return {
          value: s.total,
          color: cat?.color ?? '#94a3b8',
          label: cat?.name ?? 'Other',
        };
      }),
    [categorySpending]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Good {getGreeting()},
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>{user?.name ?? 'there'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/account/index')}
            style={[styles.avatarBtn, { backgroundColor: colors.primaryLight }]}
          >
            <Ionicons name="wallet-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Net worth card */}
        <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]} padding={20}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(totalBalance, currency)}
          </Text>
          <View style={styles.monthRow}>
            <View style={styles.monthItem}>
              <Ionicons name="arrow-down-circle" size={16} color="#a5f3fc" />
              <Text style={styles.monthLabel}>Income</Text>
              <Text style={styles.monthValue}>
                {formatCurrency(monthSummary.income, currency, { compact: true })}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.monthItem}>
              <Ionicons name="arrow-up-circle" size={16} color="#fca5a5" />
              <Text style={styles.monthLabel}>Expense</Text>
              <Text style={styles.monthValue}>
                {formatCurrency(monthSummary.expense, currency, { compact: true })}
              </Text>
            </View>
          </View>
        </Card>

        {/* Accounts */}
        {accounts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Accounts</Text>
              <TouchableOpacity onPress={() => router.push('/account/index')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {accounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  account={acc}
                  onPress={() => router.push(`/account/${acc.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Spending by category */}
        {donutData.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{monthLabel}</Text>
              <TouchableOpacity onPress={() => router.push('/reports')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Reports</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartRow}>
              <DonutChart
                data={donutData}
                size={160}
                strokeWidth={26}
                centerLabel="Spent"
                centerValue={monthSummary.expense}
                currency={currency}
              />
              <View style={styles.legend}>
                {donutData.map((d, i) => (
                  <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                    <Text style={[styles.legendLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                      {d.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        )}

        {/* Recent transactions */}
        {recentTransactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <Card padding={4}>
              {recentTransactions.map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  onPress={() => router.push(`/transaction/${t.id}`)}
                />
              ))}
            </Card>
          </View>
        )}

        {accounts.length === 0 && recentTransactions.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="sparkles" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Ready to start!</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tap + to add your first transaction.
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB onPress={() => router.push('/transaction/add')} />
    </View>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  monthLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  monthValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
