import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';

const PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function PinSetup() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { setupPin, enableBiometrics, hasBiometrics } = useAuth();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [stage, setStage] = useState<'create' | 'confirm'>('create');
  const [loading, setLoading] = useState(false);

  const current = stage === 'create' ? pin : confirmPin;
  const setter = stage === 'create' ? setPin : setConfirmPin;

  const handleKey = async (key: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === '⌫') {
      setter((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '') return;

    const next = current + key;
    setter(next);

    if (next.length === 6) {
      if (stage === 'create') {
        setStage('confirm');
      } else {
        if (next !== pin) {
          Alert.alert("PINs don't match", 'Please try again.');
          setConfirmPin('');
          setPin('');
          setStage('create');
        } else {
          setLoading(true);
          try {
            await setupPin(pin);
            const bio = await hasBiometrics();
            if (bio) {
              Alert.alert(
                'Enable Biometrics?',
                'Use Face ID or fingerprint to unlock the app.',
                [
                  { text: 'Skip', onPress: () => router.replace('/(tabs)') },
                  {
                    text: 'Enable',
                    onPress: async () => {
                      await enableBiometrics();
                      router.replace('/(tabs)');
                    },
                  },
                ]
              );
            } else {
              router.replace('/(tabs)');
            }
          } finally {
            setLoading(false);
          }
        }
      }
    }
  };

  const skip = () => router.replace('/(tabs)');

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <TouchableOpacity onPress={skip} style={styles.skipBtn}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
      </TouchableOpacity>

      <Ionicons name="lock-closed" size={48} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>
        {stage === 'create' ? 'Create PIN' : 'Confirm PIN'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {stage === 'create'
          ? 'Set a 6-digit PIN to secure your app'
          : 'Enter your PIN again to confirm'}
      </Text>

      {/* Dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.pinDot,
              {
                backgroundColor:
                  i < current.length ? colors.primary : colors.border,
                transform: [{ scale: i < current.length ? 1.2 : 1 }],
              },
            ]}
          />
        ))}
      </View>

      {/* Numpad */}
      <View style={styles.pad}>
        {PAD.map((key, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.key, { backgroundColor: key ? colors.card : 'transparent' }]}
            onPress={() => handleKey(key)}
            disabled={loading || (key === '' && i !== 11)}
            activeOpacity={0.7}
          >
            <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  skipText: {
    fontSize: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
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
});
