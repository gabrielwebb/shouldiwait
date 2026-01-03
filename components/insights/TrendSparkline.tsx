import { View, Text, StyleSheet, useColorScheme, Platform } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { getTextColor } from '@/constants/Colors';

interface TrendSparklineProps {
  data: Array<{ date: number; avgRating: number; count: number }>;
  width?: number;
  height?: number;
}

export function TrendSparkline({ data, width = 300, height = 80 }: TrendSparklineProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Filter out days with no ratings
  const validData = data.filter((d) => d.count > 0);

  if (validData.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={[styles.noDataText, { color: getTextColor(isDark, 'tertiary') }]}>
          Not enough data yet
        </Text>
      </View>
    );
  }

  // Calculate dimensions
  const padding = 12;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Normalize data to chart dimensions (1-5 scale)
  const minRating = 1;
  const maxRating = 5;

  const points = validData.map((point, index) => {
    const x = padding + (index / (validData.length - 1)) * chartWidth;
    const normalizedRating = (point.avgRating - minRating) / (maxRating - minRating);
    const y = padding + chartHeight - normalizedRating * chartHeight;
    return { x, y, rating: point.avgRating };
  });

  // Create polyline points string
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Determine line color based on average trend
  const avgRating = validData.reduce((sum, d) => sum + d.avgRating, 0) / validData.length;
  const lineColor = avgRating >= 4 ? (isDark ? '#34D399' : '#10B981') // Green
    : avgRating >= 3 ? (isDark ? '#FFE55C' : '#FFD60A') // Yellow
    : (isDark ? '#F87171' : '#EF4444'); // Red

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Line chart */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={lineColor}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    fontStyle: 'italic',
  },
});
