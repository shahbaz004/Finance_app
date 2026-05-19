import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/formatters';

interface BarGroup {
  label: string;
  income: number;
  expense: number;
}

interface BarChartProps {
  data: BarGroup[];
  height?: number;
  currency?: string;
}

export function BarChart({ data, height = 160, currency = 'USD' }: BarChartProps) {
  const { colors } = useTheme();

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={{ color: colors.textMuted }}>No data</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.container, { height }]}>
        {data.map((group, i) => {
          const incomeH = (group.income / maxVal) * (height - 40);
          const expenseH = (group.expense / maxVal) * (height - 40);
          return (
            <View key={i} style={styles.group}>
              <View style={[styles.barsRow, { height: height - 40 }]}>
                <View style={styles.barWrap}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: incomeH,
                        backgroundColor: colors.income,
                        borderRadius: 4,
                      },
                    ]}
                  />
                </View>
                <View style={[styles.barWrap, { marginLeft: 2 }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: expenseH,
                        backgroundColor: colors.expense,
                        borderRadius: 4,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.label, { color: colors.textMuted }]}>{group.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  group: {
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 44,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  barWrap: {
    justifyContent: 'flex-end',
  },
  bar: {
    width: 14,
    minHeight: 2,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
