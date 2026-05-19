import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CURRENCIES } from '../../constants/currencies';
import { Theme } from '../../types';

export default function Settings() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const { updateUserSettings } = useAppStore();
  const { enableBiometrics, disableBiometrics, removePin } = useAuth();

  const [showCurrency, setShowCurrency] = useState(false);
  const [showName, setShowName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');

  const setTheme = (theme: Theme) => updateUserSettings({ theme });

  const toggleBiometrics = async (enabled: boolean) => {
    if (enabled) {
      const ok = await enableBiometrics();
      if (!ok) Alert.alert('Not available', 'Biometric authentication is not available on this device.');
    } else {
      Alert.alert('Disable Biometrics', 'You can still use your PIN.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disable', style: 'destructive', onPress: disableBiometrics },
      ]);
    }
  };

  const handleRemoveLock = () => {
    Alert.alert('Remove App Lock', 'This will remove your PIN and biometrics.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: removePin },
    ]);
  };

  const SettingRow = ({
    icon, label, value, onPress, right, iconColor,
  }: {
    icon: string; label: string; value?: string; onPress?: () => void;
    right?: React.ReactNode; iconColor?: string;
  }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, { backgroundColor: (iconColor ?? colors.primary) + '18' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor ?? colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {value && <Text style={[styles.rowValue, { color: colors.textMuted }]}>{value}</Text>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />)}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop: 16, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {(user?.name ?? 'M').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.name ?? 'Me'}</Text>
          <Text style={[styles.profileSub, { color: colors.textMuted }]}>
            {user?.currency ?? 'USD'}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ACCOUNT</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <SettingRow icon="person" label="Name" value={user?.name} onPress={() => { setNameInput(user?.name ?? ''); setShowName(true); }} />
        <SettingRow icon="cash" label="Currency" value={user?.currency} onPress={() => setShowCurrency(true)} />
        <SettingRow icon="wallet-outline" label="Accounts" onPress={() => router.push('/account/index')} />
        <SettingRow icon="bar-chart-outline" label="Reports" onPress={() => router.push('/reports')} />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        {(['system', 'light', 'dark'] as Theme[]).map((t, i, arr) => (
          <SettingRow
            key={t}
            icon={t === 'dark' ? 'moon' : t === 'light' ? 'sunny' : 'phone-portrait-outline'}
            label={t.charAt(0).toUpperCase() + t.slice(1) + ' Mode'}
            right={
              <View style={[styles.radio, { borderColor: colors.primary, backgroundColor: user?.theme === t ? colors.primary : 'transparent' }]}>
                {user?.theme === t && <View style={styles.radioInner} />}
              </View>
            }
            onPress={() => setTheme(t)}
          />
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SECURITY</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <SettingRow
          icon="finger-print"
          label="Biometric Lock"
          right={
            <Switch
              value={user?.biometricsEnabled ?? false}
              onValueChange={toggleBiometrics}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          }
        />
        {user?.pinHash ? (
          <SettingRow icon="lock-closed" label="Change PIN" onPress={() => router.push('/(auth)/pin-setup')} />
        ) : (
          <SettingRow icon="lock-closed" label="Set PIN" onPress={() => router.push('/(auth)/pin-setup')} />
        )}
        {(user?.pinHash || user?.biometricsEnabled) && (
          <SettingRow icon="lock-open-outline" iconColor={colors.danger} label="Remove App Lock" onPress={handleRemoveLock} />
        )}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APP</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <SettingRow icon="information-circle-outline" label="Version" value="1.0.0" />
      </View>

      {/* Name edit modal */}
      <Modal visible={showName} onClose={() => setShowName(false)} title="Edit Name">
        <Input
          label="Your name"
          value={nameInput}
          onChangeText={setNameInput}
          placeholder="e.g. Alex"
          containerStyle={{ marginBottom: 20 }}
          autoFocus
        />
        <Button
          title="Save"
          onPress={async () => {
            if (nameInput.trim()) await updateUserSettings({ name: nameInput.trim() });
            setShowName(false);
          }}
          fullWidth
        />
      </Modal>

      {/* Currency picker modal */}
      <Modal visible={showCurrency} onClose={() => setShowCurrency(false)} title="Select Currency" scrollable>
        {CURRENCIES.map((c) => (
          <TouchableOpacity
            key={c.code}
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={async () => {
              await updateUserSettings({ currency: c.code });
              setShowCurrency(false);
            }}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{c.symbol}  {c.code}</Text>
              <Text style={[styles.rowValue, { color: colors.textMuted }]}>{c.name}</Text>
            </View>
            {user?.currency === c.code && (
              <Ionicons name="checkmark" size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
  },
  profileSub: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  section: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 13, marginTop: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
