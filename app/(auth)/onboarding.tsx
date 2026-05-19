import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useAccountStore } from '../../store/useAccountStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CURRENCIES } from '../../constants/currencies';
import { ACCOUNT_COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'welcome',
    title: 'Welcome to\nFinanceApp',
    subtitle: 'Your personal finance companion. Track spending, set budgets, and reach your goals.',
    icon: 'wallet' as const,
  },
  {
    id: 'track',
    title: 'Track Every\nTransaction',
    subtitle: 'Log income and expenses with categories, receipts, and recurring rules.',
    icon: 'receipt' as const,
  },
  {
    id: 'budget',
    title: 'Budget\nSmarter',
    subtitle: 'Set monthly limits per category and get notified before you overspend.',
    icon: 'pie-chart' as const,
  },
  {
    id: 'goals',
    title: 'Achieve Your\nGoals',
    subtitle: 'Create savings goals with deadlines and watch confetti fly when you hit them.',
    icon: 'trophy' as const,
  },
];

export default function Onboarding() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateUserSettings } = useAppStore();
  const { addAccount } = useAccountStore();

  const [step, setStep] = useState<'slides' | 'setup'>('slides');
  const [slideIndex, setSlideIndex] = useState(0);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const handleFinishSlides = () => setStep('setup');

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateUserSettings({
        name: name.trim() || 'Me',
        currency,
        onboardingComplete: true,
      });
      // Create a default cash wallet
      const user = useAppStore.getState().user;
      if (user?.id) {
        await addAccount({
          userId: user.id,
          name: 'Cash',
          type: 'cash',
          balance: 0,
          color: ACCOUNT_COLORS[0],
          icon: 'cash',
        });
      }
      router.replace('/(auth)/pin-setup');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'slides') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={SLIDES}
          keyExtractor={(s) => s.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            setSlideIndex(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={[styles.slideIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={item.icon} size={72} color={colors.primary} />
              </View>
              <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.slideSubtitle, { color: colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            </View>
          )}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === slideIndex ? colors.primary : colors.border,
                  width: i === slideIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        <View style={[styles.slideActions, { paddingBottom: insets.bottom + 20 }]}>
          {slideIndex < SLIDES.length - 1 ? (
            <TouchableOpacity onPress={handleFinishSlides} style={styles.skip}>
              <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <Button title="Get Started" onPress={handleFinishSlides} fullWidth size="lg" />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: insets.top + 32 }]}>
      <Text style={[styles.setupTitle, { color: colors.text }]}>Quick Setup</Text>
      <Text style={[styles.setupSubtitle, { color: colors.textSecondary }]}>
        Tell us a bit about yourself
      </Text>

      <Input
        label="Your name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Alex"
        containerStyle={{ marginTop: 32, marginBottom: 24 }}
        autoFocus
      />

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Currency</Text>
      <FlatList
        data={CURRENCIES.slice(0, 12)}
        keyExtractor={(c) => c.code}
        numColumns={3}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.currencyChip,
              {
                backgroundColor: currency === item.code ? colors.primary : colors.cardSecondary,
                borderColor: currency === item.code ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setCurrency(item.code)}
          >
            <Text style={[styles.currencySymbol, { color: currency === item.code ? '#fff' : colors.primary }]}>
              {item.symbol}
            </Text>
            <Text style={[styles.currencyCode, { color: currency === item.code ? '#fff' : colors.text }]}>
              {item.code}
            </Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 32 }}
      />

      <Button
        title="Continue"
        onPress={handleComplete}
        loading={loading}
        fullWidth
        size="lg"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  slideIcon: {
    width: 140,
    height: 140,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  slideActions: {
    paddingHorizontal: 24,
  },
  skip: {
    alignSelf: 'center',
    padding: 12,
  },
  skipText: {
    fontSize: 15,
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  setupSubtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  currencyChip: {
    flex: 1,
    margin: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
