import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { BudgetCard } from '../../components/budget/BudgetCard';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export default function Budget() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const { categories, budgetStatuses, isLoading, loadBudget, updateBudgetLimit } = useBudgetStore();

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const currency = user?.currency ?? 'USD';

  useEffect(() => {
    if (user?.id) loadBudget(user.id, year, month);
  }, [user?.id]);

  const totalBudget = budgetStatuses.reduce((s, b) => s + b.budgetLimit, 0);
  const totalSpent  = budgetStatuses.reduce((s, b) => s + b.spent, 0);

  const unsetCategories = categories.filter(
    (c) =>
      (c.type === 'expense' || c.type === 'both') &&
      !budgetStatuses.find((b) => b.categoryId === c.id)
  );

  const openEditor = (cat: Category, existingLimit?: number) => {
    setEditingCat(cat);
    setLimitInput(existingLimit?.toString() ?? '');
  };

  const handleSave = async () => {
    if (!user?.id || !editingCat) return;
    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit < 0) {
      Alert.alert('Invalid limit', 'Please enter a valid positive number.');
      return;
    }
    setSaving(true);
    try {
      await updateBudgetLimit(editingCat.id, limit || null, user.id, year, month);
      setEditingCat(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: 16, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        {budgetStatuses.length > 0 && (
          <View style={[styles.summary, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>This Month</Text>
            <View style={styles.summaryRow}>
              <View>
                <Text style={[styles.summaryAmount, { color: colors.expense }]}>
                  {formatCurrency(totalSpent, currency)}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Spent</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.summaryAmount, { color: colors.text }]}>
                  {formatCurrency(totalBudget, currency)}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Budgeted</Text>
              </View>
            </View>
          </View>
        )}

        {/* Budget cards */}
        {budgetStatuses.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Budgets</Text>
            {budgetStatuses.map((b) => {
              const cat = categories.find((c) => c.id === b.categoryId);
              return (
                <TouchableOpacity
                  key={b.categoryId}
                  onLongPress={() => cat && openEditor(cat, b.budgetLimit)}
                  activeOpacity={0.85}
                >
                  <BudgetCard budget={b} />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Set budget for other categories */}
        {unsetCategories.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Set Budget</Text>
            {unsetCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.unsetRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => openEditor(cat)}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + '18' }]}>
                  <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                </View>
                <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {budgetStatuses.length === 0 && unsetCategories.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="pie-chart-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No categories available
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Edit modal */}
      <Modal
        visible={editingCat !== null}
        onClose={() => setEditingCat(null)}
        title={`Budget for ${editingCat?.name}`}
      >
        <Input
          label="Monthly limit"
          value={limitInput}
          onChangeText={setLimitInput}
          keyboardType="decimal-pad"
          placeholder="e.g. 500"
          autoFocus
          containerStyle={{ marginBottom: 20 }}
          leftIcon={<Ionicons name="cash-outline" size={18} color={colors.textMuted} />}
        />
        <View style={styles.modalActions}>
          <Button title="Remove" variant="ghost" onPress={async () => {
            if (!user?.id || !editingCat) return;
            await updateBudgetLimit(editingCat.id, null, user.id, year, month);
            setEditingCat(null);
          }} />
          <Button title="Save" onPress={handleSave} loading={saving} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
  },
  summary: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 4,
  },
  unsetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
