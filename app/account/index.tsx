import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useAccountStore } from '../../store/useAccountStore';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Account, AccountType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ACCOUNT_COLORS } from '../../constants/colors';

const ACCOUNT_TYPES: { label: string; value: AccountType; icon: string }[] = [
  { label: 'Cash', value: 'cash', icon: 'cash' },
  { label: 'Bank', value: 'bank', icon: 'business' },
  { label: 'Credit', value: 'credit', icon: 'card' },
  { label: 'Savings', value: 'savings', icon: 'wallet' },
];

export default function Accounts() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const { accounts, addAccount, removeAccount, totalBalance } = useAccountStore();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const currency = user?.currency ?? 'USD';

  const resetForm = () => { setName(''); setBalance(''); setType('bank'); setColor(ACCOUNT_COLORS[0]); };

  const handleAdd = async () => {
    if (!user?.id) return;
    if (!name.trim()) { Alert.alert('Name required'); return; }
    const bal = parseFloat(balance) || 0;
    setSaving(true);
    try {
      const acc = ACCOUNT_TYPES.find((t) => t.value === type)!;
      await addAccount({ userId: user.id, name: name.trim(), type, balance: bal, color, icon: acc.icon });
      setShowAdd(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (account: Account) => {
    Alert.alert('Delete Account', `Delete "${account.name}"? All associated transactions will remain.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeAccount(account.id, user!.id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={accounts}
        keyExtractor={(a) => a.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Balance</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>
              {formatCurrency(totalBalance(), currency)}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.accountRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/account/${item.id}`)}
            onLongPress={() => handleDelete(item)}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <View style={styles.accInfo}>
              <Text style={[styles.accName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.accType, { color: colors.textMuted }]}>{item.type}</Text>
            </View>
            <Text style={[styles.accBalance, { color: item.balance < 0 ? colors.danger : colors.text }]}>
              {formatCurrency(item.balance, currency)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No accounts yet</Text>
          </View>
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 20 }]}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showAdd} onClose={() => { setShowAdd(false); resetForm(); }} title="Add Account" scrollable>
        <Input label="Account name" value={name} onChangeText={setName} placeholder="e.g. Chase Checking" containerStyle={{ marginBottom: 16 }} autoFocus />
        <Input label="Starting balance" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" placeholder="0.00" containerStyle={{ marginBottom: 16 }} leftIcon={<Ionicons name="cash-outline" size={18} color={colors.textMuted} />} />

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Type</Text>
        <View style={styles.typeRow}>
          {ACCOUNT_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.typeChip, { backgroundColor: type === t.value ? colors.primary : colors.cardSecondary }]}
              onPress={() => setType(t.value)}
            >
              <Ionicons name={t.icon as any} size={16} color={type === t.value ? '#fff' : colors.textSecondary} />
              <Text style={[styles.typeChipText, { color: type === t.value ? '#fff' : colors.text }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Color</Text>
        <View style={styles.colorRow}>
          {ACCOUNT_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.text }]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <Button title="Add Account" onPress={handleAdd} loading={saving} fullWidth style={{ marginTop: 20 }} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20 },
  header: { paddingVertical: 20 },
  totalLabel: { fontSize: 14 },
  totalAmount: { fontSize: 32, fontWeight: '800' },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  accInfo: { flex: 1 },
  accName: { fontSize: 15, fontWeight: '600' },
  accType: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  accBalance: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
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
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  typeChipText: { fontSize: 13, fontWeight: '500' },
  colorRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
});
