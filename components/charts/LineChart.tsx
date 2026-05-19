import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/formatters';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  currency?: string;
}

export function LineChart({
  data,
  width = Dimensions.get('window').width - 64,
  height = 140,
  color,
  currency = 'USD',
}: LineChartProps) {
  const { colors } = useTheme();
  const lineColor = color ?? colors.primary;
  const padX = 8;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  if (data.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Not enough data</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * chartW;
    const y = padY + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        {/* Baseline */}
        <Line
          x1={padX}
          y1={padY + chartH}
          x2={padX + chartW}
          y2={padY + chartH}
          stroke={colors.border}
          strokeWidth={1}
        />
        {/* Line */}
        <Polyline
          points={polyPoints}
          fill="none"
          stroke={lineColor}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dots */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={lineColor} />
        ))}
        {/* Labels */}
        {points
          .filter((_, i) => i === 0 || i === points.length - 1 || data.length <= 6)
          .map((p, i) => (
            <SvgText
              key={i}
              x={p.x}
              y={height - 2}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
