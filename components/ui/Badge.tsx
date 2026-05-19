import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  color: string;
  textColor?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, textColor = '#fff', size = 'md' }: BadgeProps) {
  return (
    <View style={[styles.badge, size === 'sm' && styles.sm, { backgroundColor: color + '22' }]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});
