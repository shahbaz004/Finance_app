import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function LockScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, unlock, unlockWithPin } = useAuth();

  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (user?.biometricsEnabled) {
      tryBiometric();
    }
  }, []);

  const tryBiometric = async () => {
    const ok = await unlock();
    if (ok) {
      router.replace('/(tabs)');
    }
  };

  const handleKey = async (key: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === '⌫') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (key === '') return;

    const next = pin + key;
    setPin(next);

    if (next.length === 6) {
      const ok = await unlockWithPin(next);
      if (ok) {
        router.replace('/(tabs)');
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setAttempts((a) => a + 1);
        setPin('');
        if (attempts >= 4) {
          Alert.alert('Too many attempts', 'Please wait before trying again.');
        }
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}>
      <Ionicons name="lock-closed" size={52} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {user?.name ?? 'Enter your PIN to unlock'}
      </Text>

      <View style={styles.dotsRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.pinDot,
              { backgroundColor: i < pin.length ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      <View style={styles.pad}>
        {PAD.map((key, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.key, { backgroundColor: key ? colors.card : 'transparent' }]}
            onPress={() => handleKey(key)}
            disabled={key === '' && i !== 11}
            activeOpacity={0.7}
          >
            <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {user?.biometricsEnabled && (
        <TouchableOpacity style={styles.bioBtn} onPress={tryBiometric}>
          <Ionicons name="finger-print" size={32} color={colors.primary} />
          <Text style={[styles.bioText, { color: colors.primary }]}>Use Biometrics</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    marginBottom: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    gap: 12,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
  },
  bioBtn: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
  },
  bioText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
