import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useAuthStore } from "@/src/store/auth.store";
import { ownerService } from "@/src/services/owner.service";
import { getShadow } from "@/src/utils/style";

const screenWidth = Dimensions.get("window").width;

export default function RevenueScreen() {
  const { darkMode } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await ownerService.getDashboard(); // Dùng tạm dashboard API
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const chartConfig = {
    backgroundColor: darkMode ? "#1F2937" : "#fff",
    backgroundGradientFrom: darkMode ? "#1F2937" : "#fff",
    backgroundGradientTo: darkMode ? "#1F2937" : "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: (opacity = 1) => darkMode ? `rgba(156, 163, 175, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#22C55E" }
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <Text style={styles.headerTitle}>Thống kê & Báo cáo</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={[styles.mainCard, darkMode && { backgroundColor: "#1F2937" }]}>
              <Text style={[styles.mainCardLabel, darkMode && { color: "#9CA3AF" }]}>Tổng doanh thu tháng này</Text>
              <Text style={[styles.mainCardValue, darkMode && { color: "#fff" }]}>
                {(stats?.total_revenue || 0).toLocaleString()}đ
              </Text>
              <View style={styles.trendRow}>
                <Ionicons name="trending-up" size={16} color="#22C55E" />
                <Text style={styles.trendText}>+12.5% so với tháng trước</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Biểu đồ doanh thu</Text>
            <View style={[styles.chartBox, darkMode && { backgroundColor: "#1F2937" }]}>
              <LineChart
                data={{
                  labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
                  datasets: [{ data: [15, 28, 23, 35, 32, 45] }]
                }}
                width={screenWidth - 72}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>

            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Tỉ lệ lấp đầy</Text>
             <View style={[styles.chartBox, darkMode && { backgroundColor: "#1F2937" }]}>
              <BarChart
                data={{
                  labels: ["Sân 5A", "Sân 5B", "Sân 7A", "Sân 11"],
                  datasets: [{ data: [80, 65, 90, 45] }]
                }}
                width={screenWidth - 72}
                height={200}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={chartConfig}
                style={styles.chart}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#22C55E",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...getShadow(0.1, 15, 5),
    marginBottom: 24,
  },
  mainCardLabel: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  mainCardValue: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 5 },
  trendText: { color: '#22C55E', fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  chartBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    ...getShadow(0.05, 10, 3),
  },
  chart: { marginVertical: 8, borderRadius: 16 }
});
