import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store/useAppStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { BarChart } from '../components/charts/BarChart';
import { LineChart } from '../components/charts/LineChart';
import { DonutChart } from '../components/charts/DonutChart';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAllTransactions } from '../db/queries/transactions';
import { exportCSV, exportSimplePDF } from '../utils/export';
import { formatCurrency, formatMonthShort, formatMonthYear } from '../utils/formatters';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export default function Reports() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const { monthlyReports, loadMonthlyReports, categorySpending } = useTransactionStore();

  const [exporting, setExporting] = useState(false);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  const currency = user?.currency ?? 'USD';
  const now = new Date();

  useEffect(() => {
    if (!user?.id) return;
    loadMonthlyReports(user.id);
    getAllTransactions(user.id).then(setAllTransactions);
  }, [user?.id]);

  const barData = [...monthlyReports].reverse().map((r) => ({
    label: formatMonthShort(r.month),
    income: r.income,
    expense: r.expense,
  }));

  const lineData = [...monthlyReports].reverse().map((r) => ({
    label: formatMonthShort(r.month),
    value: r.income - r.expense,
  }));

  const donutData = categorySpending.slice(0, 7).map((s) => {
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === s.categoryId);
    return { value: s.total, color: cat?.color ?? '#94a3b8', label: cat?.name ?? 'Other' };
  });

  const totalIncome = monthlyReports.reduce((s, r) => s + r.income, 0);
  const totalExpense = monthlyReports.reduce((s, r) => s + r.expense, 0);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportCSV(allTransactions, currency);
    } catch (e) {
      Alert.alert('Export failed', 'Could not export transactions.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const monthStr = formatMonthYear(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      await exportSimplePDF(allTransactions, currency, monthStr);
    } catch (e) {
      Alert.alert('Export failed', 'Could not generate report.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop: 16, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary tiles */}
      <View style={styles.tiles}>
        <Card style={[styles.tile, { flex: 1 }]} padding={14}>
          <Text style={[styles.tileLabel, { color: colors.textSecondary }]}>12-Mo Income</Text>
          <Text style={[styles.tileValue, { color: colors.income }]}>
            {formatCurrency(totalIncome, currency, { compact: true })}
          </Text>
        </Card>
        <Card style={[styles.tile, { flex: 1 }]} padding={14}>
          <Text style={[styles.tileLabel, { color: colors.textSecondary }]}>12-Mo Expense</Text>
          <Text style={[styles.tileValue, { color: colors.expense }]}>
            {formatCurrency(totalExpense, currency, { compact: true })}
          </Text>
        </Card>
      </View>

      {/* Income vs Expense bar chart */}
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Income vs Expense</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Expense</Text>
          </View>
        </View>
        <BarChart data={barData} currency={currency} />
      </Card>

      {/* Net worth line chart */}
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Net Cash Flow</Text>
        <LineChart data={lineData} currency={currency} color={colors.primary} />
      </Card>

      {/* Category donut */}
      {donutData.length > 0 && (
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Spending by Category</Text>
          <View style={styles.donutRow}>
            <DonutChart
              data={donutData}
              size={160}
              strokeWidth={26}
              centerLabel="This month"
              centerValue={categorySpending.reduce((s, c) => s + c.total, 0)}
              currency={currency}
            />
            <View style={styles.donutLegend}>
              {donutData.map((d, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {d.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      )}

      {/* Monthly breakdown */}
      {monthlyReports.length > 0 && (
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Monthly Breakdown</Text>
          {monthlyReports.map((r) => (
            <View key={r.month} style={[styles.monthRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.monthLabel, { color: colors.text }]}>
                {formatMonthYear(r.month)}
              </Text>
              <View style={styles.monthAmounts}>
                <Text style={[styles.monthIncome, { color: colors.income }]}>
                  +{formatCurrency(r.income, currency, { compact: true })}
                </Text>
                <Text style={[styles.monthExpense, { color: colors.expense }]}>
                  -{formatCurrency(r.expense, currency, { compact: true })}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Export */}
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Export</Text>
        <View style={styles.exportRow}>
          <Button
            title="Export CSV"
            variant="secondary"
            onPress={handleExportCSV}
            loading={exporting}
            icon={<Ionicons name="download-outline" size={16} color={colors.text} />}
            style={{ flex: 1 }}
          />
          <Button
            title="Export PDF"
            variant="secondary"
            onPress={handleExportPDF}
            loading={exporting}
            icon={<Ionicons name="document-outline" size={16} color={colors.text} />}
            style={{ flex: 1 }}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  tiles: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  tile: {},
  tileLabel: { fontSize: 12, marginBottom: 4 },
  tileValue: { fontSize: 20, fontWeight: '800' },
  chartCard: { marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  donutLegend: { flex: 1, gap: 6 },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  monthLabel: { fontSize: 14, fontWeight: '500' },
  monthAmounts: { flexDirection: 'row', gap: 12 },
  monthIncome: { fontSize: 13, fontWeight: '600' },
  monthExpense: { fontSize: 13, fontWeight: '600' },
  exportRow: { flexDirection: 'row', gap: 10 },
});
