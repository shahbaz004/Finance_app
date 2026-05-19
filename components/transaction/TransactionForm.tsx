import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Transaction, TransactionType, Category, Account } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { isoDateString } from '../../utils/finance';

interface TransactionFormProps {
  categories: Category[];
  accounts: Account[];
  initialValues?: Partial<Transaction>;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

type Step = 'amount' | 'details';

export function TransactionForm({
  categories,
  accounts,
  initialValues,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const { colors } = useTheme();

  const [type, setType] = useState<TransactionType>(initialValues?.type ?? 'expense');
  const [amount, setAmount] = useState(initialValues?.amount?.toString() ?? '');
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [accountId, setAccountId] = useState(
    initialValues?.accountId ?? accounts[0]?.id ?? ''
  );
  const [toAccountId, setToAccountId] = useState(initialValues?.toAccountId ?? '');
  const [date, setDate] = useState(initialValues?.date ?? isoDateString());
  const [note, setNote] = useState(initialValues?.note ?? '');
  const [receiptUri, setReceiptUri] = useState(initialValues?.receiptUri ?? '');
  const [isRecurring, setIsRecurring] = useState(initialValues?.isRecurring ?? false);
  const [recurrenceRule, setRecurrenceRule] = useState<Transaction['recurrenceRule']>(
    initialValues?.recurrenceRule ?? null
  );
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'both'
  );

  const pickReceipt = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to photos to attach receipts.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  }, []);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Category required', 'Please select a category.');
      return;
    }
    if (!accountId) {
      Alert.alert('Account required', 'Please select an account.');
      return;
    }
    if (type === 'transfer' && !toAccountId) {
      Alert.alert('Destination required', 'Please select a destination account.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        accountId,
        categoryId,
        amount: parsedAmount,
        type,
        date,
        note: note || null,
        receiptUri: receiptUri || null,
        isRecurring,
        recurrenceRule: isRecurring ? recurrenceRule : null,
        toAccountId: type === 'transfer' ? toAccountId : null,
      });
    } finally {
      setLoading(false);
    }
  };

  const typeColor = type === 'income' ? colors.income : type === 'transfer' ? colors.transfer : colors.expense;

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Type selector */}
      <View style={styles.typeRow}>
        {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.typeBtn,
              {
                backgroundColor: type === t ? typeColor : colors.cardSecondary,
              },
            ]}
            onPress={() => { setType(t); setCategoryId(''); }}
          >
            <Text
              style={[
                styles.typeBtnText,
                { color: type === t ? '#fff' : colors.textSecondary },
              ]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount */}
      <Input
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        containerStyle={styles.field}
        leftIcon={<Ionicons name="cash-outline" size={18} color={colors.textMuted} />}
      />

      {/* Category */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {filteredCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              {
                backgroundColor: categoryId === cat.id ? cat.color : colors.cardSecondary,
                borderColor: categoryId === cat.id ? cat.color : colors.border,
              },
            ]}
            onPress={() => setCategoryId(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={14}
              color={categoryId === cat.id ? '#fff' : cat.color}
            />
            <Text
              style={[
                styles.chipText,
                { color: categoryId === cat.id ? '#fff' : colors.text },
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Account */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>Account</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {accounts.map((acc) => (
          <TouchableOpacity
            key={acc.id}
            style={[
              styles.chip,
              {
                backgroundColor: accountId === acc.id ? acc.color : colors.cardSecondary,
                borderColor: accountId === acc.id ? acc.color : colors.border,
              },
            ]}
            onPress={() => setAccountId(acc.id)}
          >
            <Ionicons name={acc.icon as any} size={14} color={accountId === acc.id ? '#fff' : acc.color} />
            <Text style={[styles.chipText, { color: accountId === acc.id ? '#fff' : colors.text }]}>
              {acc.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* To account (transfers) */}
      {type === 'transfer' && (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>To Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {accounts.filter((a) => a.id !== accountId).map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: toAccountId === acc.id ? acc.color : colors.cardSecondary,
                    borderColor: toAccountId === acc.id ? acc.color : colors.border,
                  },
                ]}
                onPress={() => setToAccountId(acc.id)}
              >
                <Text style={[styles.chipText, { color: toAccountId === acc.id ? '#fff' : colors.text }]}>
                  {acc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Date */}
      <Input
        label="Date"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        containerStyle={styles.field}
        leftIcon={<Ionicons name="calendar-outline" size={18} color={colors.textMuted} />}
      />

      {/* Note */}
      <Input
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        placeholder="Add a note..."
        containerStyle={styles.field}
        multiline
        leftIcon={<Ionicons name="create-outline" size={18} color={colors.textMuted} />}
      />

      {/* Receipt */}
      <TouchableOpacity style={[styles.receiptBtn, { borderColor: colors.border }]} onPress={pickReceipt}>
        <Ionicons name="camera-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.receiptText, { color: colors.textSecondary }]}>
          {receiptUri ? 'Change Receipt' : 'Attach Receipt'}
        </Text>
      </TouchableOpacity>
      {receiptUri ? (
        <Image source={{ uri: receiptUri }} style={styles.receipt} resizeMode="cover" />
      ) : null}

      {/* Recurring */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Recurring</Text>
        <Switch
          value={isRecurring}
          onValueChange={setIsRecurring}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>
      {isRecurring && (
        <View style={styles.recurrenceRow}>
          {(['daily', 'weekly', 'monthly'] as NonNullable<Transaction['recurrenceRule']>[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.chip,
                {
                  backgroundColor: recurrenceRule === r ? colors.primary : colors.cardSecondary,
                  borderColor: recurrenceRule === r ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setRecurrenceRule(r)}
            >
              <Text style={[styles.chipText, { color: recurrenceRule === r ? '#fff' : colors.text }]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Cancel" onPress={onCancel} variant="secondary" style={styles.actionBtn} />
        <Button
          title={initialValues?.amount ? 'Save Changes' : 'Add Transaction'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.actionBtn}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  typeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  chips: {
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recurrenceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    padding: 12,
    marginBottom: 12,
  },
  receiptText: {
    fontSize: 14,
  },
  receipt: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
