import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/formatters';

interface Slice {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  data: Slice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: number;
  currency?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number): string {
  const s = polarToCartesian(cx, cy, r, end);
  const e = polarToCartesian(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

export function DonutChart({
  data,
  size = 180,
  strokeWidth = 28,
  centerLabel,
  centerValue,
  currency = 'USD',
}: DonutChartProps) {
  const { colors } = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
        <View style={styles.center}>
          <Text style={[styles.centerLabel, { color: colors.textMuted }]}>No data</Text>
        </View>
      </View>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  let currentAngle = 0;

  const arcs = data.map((slice) => {
    const angle = (slice.value / total) * 360;
    const start = currentAngle;
    const end = currentAngle + angle;
    currentAngle = end;
    return { ...slice, start, end };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {arcs.map((arc, i) => (
          <Path
            key={i}
            d={describeArc(cx, cy, r, arc.start, arc.end)}
            stroke={arc.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
          />
        ))}
      </Svg>
      <View style={styles.center}>
        {centerLabel && (
          <Text style={[styles.centerLabel, { color: colors.textSecondary }]}>
            {centerLabel}
          </Text>
        )}
        {centerValue !== undefined && (
          <Text style={[styles.centerValue, { color: colors.text }]}>
            {formatCurrency(centerValue, currency, { compact: true })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  centerValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
});
