import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useGoalStore } from '../../store/useGoalStore';
import { GoalCard } from '../../components/goal/GoalCard';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Goal } from '../../types';
import { GOAL_COLORS } from '../../constants/colors';
import { isoDateString } from '../../utils/finance';
import { formatCurrency } from '../../utils/formatters';

const GOAL_ICONS = ['flag', 'home', 'car', 'airplane', 'book', 'laptop', 'medical', 'diamond', 'trophy', 'star'];

export default function Goals() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const { goals, isLoading, addGoal, editGoal, removeGoal, contribute, celebratingGoalId, setCelebrating } = useGoalStore();

  const [showAdd, setShowAdd] = useState(false);
  const [showContribute, setShowContribute] = useState<Goal | null>(null);
  const [contributionInput, setContributionInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Add form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('flag');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);

  const currency = user?.currency ?? 'USD';

  const resetForm = () => {
    setTitle(''); setTargetAmount(''); setDeadline('');
    setSelectedIcon('flag'); setSelectedColor(GOAL_COLORS[0]);
  };

  const handleAddGoal = async () => {
    if (!user?.id) return;
    if (!title.trim()) { Alert.alert('Title required'); return; }
    const amount = parseFloat(targetAmount);
    if (!amount || amount <= 0) { Alert.alert('Invalid target amount'); return; }
    setSaving(true);
    try {
      await addGoal({
        userId: user.id,
        title: title.trim(),
        targetAmount: amount,
        currentAmount: 0,
        deadline: deadline || null,
        linkedAccountId: null,
        icon: selectedIcon,
        color: selectedColor,
      });
      setShowAdd(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleContribute = async () => {
    if (!showContribute) return;
    const amount = parseFloat(contributionInput);
    if (!amount || amount <= 0) { Alert.alert('Invalid amount'); return; }
    setSaving(true);
    try {
      const completed = await contribute(showContribute.id, amount);
      setShowContribute(null);
      setContributionInput('');
      if (completed) {
        setCelebrating(showContribute.id);
        setTimeout(() => setCelebrating(null), 4000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (goal: Goal) => {
    Alert.alert('Delete Goal', `Delete "${goal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeGoal(goal.id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {celebratingGoalId && (
        <ConfettiCannon count={150} origin={{ x: 200, y: 0 }} autoStart />
      )}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: 16, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        {goals.length > 0 && (
          <View style={[styles.summary, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryNum, { color: colors.text }]}>{goals.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Active Goals</Text>
            <Text style={[styles.summaryNum, { color: colors.primary, marginLeft: 24 }]}>
              {goals.filter((g) => g.currentAmount >= g.targetAmount).length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
        )}

        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            onLongPress={() => handleDelete(goal)}
            activeOpacity={0.9}
          >
            <GoalCard
              goal={goal}
              onPress={() => setShowContribute(goal)}
            />
          </TouchableOpacity>
        ))}

        {goals.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No goals yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tap + to create your first savings goal
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 80 }]}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add goal modal */}
      <Modal visible={showAdd} onClose={() => { setShowAdd(false); resetForm(); }} title="New Goal" scrollable>
        <Input label="Goal name" value={title} onChangeText={setTitle} placeholder="e.g. Emergency Fund" containerStyle={{ marginBottom: 16 }} autoFocus />
        <Input label="Target amount" value={targetAmount} onChangeText={setTargetAmount} keyboardType="decimal-pad" placeholder="0.00" containerStyle={{ marginBottom: 16 }} leftIcon={<Ionicons name="cash-outline" size={18} color={colors.textMuted} />} />
        <Input label="Deadline (optional)" value={deadline} onChangeText={setDeadline} placeholder="YYYY-MM-DD" containerStyle={{ marginBottom: 16 }} leftIcon={<Ionicons name="calendar-outline" size={18} color={colors.textMuted} />} />

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Icon</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {GOAL_ICONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              style={[styles.iconChip, { backgroundColor: selectedIcon === ic ? selectedColor : colors.cardSecondary }]}
              onPress={() => setSelectedIcon(ic)}
            >
              <Ionicons name={ic as any} size={20} color={selectedIcon === ic ? '#fff' : colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Color</Text>
        <View style={styles.colorRow}>
          {GOAL_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c, borderWidth: selectedColor === c ? 3 : 0, borderColor: colors.text }]}
              onPress={() => setSelectedColor(c)}
            />
          ))}
        </View>

        <Button title="Create Goal" onPress={handleAddGoal} loading={saving} fullWidth style={{ marginTop: 20 }} />
      </Modal>

      {/* Contribute modal */}
      <Modal visible={showContribute !== null} onClose={() => setShowContribute(null)} title={showContribute?.title ?? ''}>
        <Text style={[styles.contribSub, { color: colors.textSecondary }]}>
          {formatCurrency(showContribute?.currentAmount ?? 0, currency)} / {formatCurrency(showContribute?.targetAmount ?? 0, currency)}
        </Text>
        <Input
          label="Amount to add"
          value={contributionInput}
          onChangeText={setContributionInput}
          keyboardType="decimal-pad"
          placeholder="0.00"
          containerStyle={{ marginBottom: 20 }}
          leftIcon={<Ionicons name="cash-outline" size={18} color={colors.textMuted} />}
          autoFocus
        />
        <Button title="Add Contribution" onPress={handleContribute} loading={saving} fullWidth />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 4,
  },
  summaryNum: { fontSize: 24, fontWeight: '800' },
  summaryLabel: { fontSize: 13, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyText: { fontSize: 15, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  fieldLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  colorRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  contribSub: { fontSize: 14, marginBottom: 16 },
});
