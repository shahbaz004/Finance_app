import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calcGoalProgress, daysUntilDeadline } from '../../utils/finance';
import { ProgressBar } from '../ui/ProgressBar';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const { colors } = useTheme();
  const currency = useAppStore((s) => s.user?.currency ?? 'USD');

  const progress = calcGoalProgress(goal.currentAmount, goal.targetAmount);
  const days = daysUntilDeadline(goal.deadline);
  const remaining = goal.targetAmount - goal.currentAmount;
  const completed = progress >= 100;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: completed ? goal.color : colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: goal.color + '20' }]}>
          <Ionicons name={goal.icon as any} size={22} color={goal.color} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {goal.title}
          </Text>
          {days !== null && (
            <Text style={[styles.deadline, { color: days < 0 ? colors.danger : colors.textMuted }]}>
              {days < 0 ? 'Overdue' : `${days}d left`}
            </Text>
          )}
        </View>
        {completed && (
          <Ionicons name="checkmark-circle" size={22} color={goal.color} />
        )}
      </View>

      <ProgressBar
        percentage={progress}
        height={6}
        fillColor={goal.color}
        trackColor={colors.cardSecondary}
        status="safe"
      />

      <View style={styles.footer}>
        <Text style={[styles.current, { color: colors.text }]}>
          {formatCurrency(goal.currentAmount, currency, { compact: true })}
        </Text>
        <Text style={[styles.target, { color: colors.textMuted }]}>
          {`${Math.round(progress)}% · ${formatCurrency(goal.targetAmount, currency, { compact: true })}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  deadline: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  current: {
    fontSize: 16,
    fontWeight: '800',
  },
  target: {
    fontSize: 13,
  },
});
