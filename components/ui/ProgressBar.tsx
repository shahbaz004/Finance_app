import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  animated?: boolean;
  status?: 'safe' | 'warning' | 'exceeded';
}

export function ProgressBar({
  percentage,
  height = 8,
  trackColor,
  fillColor,
  animated = true,
  status,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const clampedPct = Math.min(Math.max(percentage, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(anim, {
        toValue: clampedPct,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      anim.setValue(clampedPct);
    }
  }, [clampedPct]);

  const resolvedFill =
    fillColor ??
    (status === 'exceeded'
      ? colors.danger
      : status === 'warning'
      ? colors.warning
      : colors.safe);

  const widthInterpolated = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor ?? colors.cardSecondary },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: resolvedFill,
            width: widthInterpolated,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {},
});
