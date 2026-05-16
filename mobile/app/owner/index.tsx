import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { useAuthStore } from "@/src/store/auth.store";
import { ownerService } from "@/src/services/owner.service";
import { getShadow } from "@/src/utils/style";

const screenWidth = Dimensions.get("window").width;

export default function OwnerDashboard() {
  const { user, darkMode } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await ownerService.getDashboard();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const Card = ({ title, value, icon, color }: any) => (
    <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.cardLabel, darkMode && { color: "#9CA3AF" }]}>{title}</Text>
      <Text style={[styles.cardValue, darkMode && { color: "#fff" }]}>{value}</Text>
    </View>
  );

  const getChartData = () => {
    if (!stats || !stats.monthly_revenue || stats.monthly_revenue.length === 0) {
      return {
        labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
        datasets: [{ data: [0, 0, 0, 0, 0, 0] }]
      };
    }

    // Fill missing months with 0
    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const data = new Array(12).fill(0);

    stats.monthly_revenue.forEach((item: any) => {
      if (item.month >= 1 && item.month <= 12) {
        data[item.month - 1] = item.revenue / 1000000; // In millions
      }
    });

    // Get last 6 months for display
    const currentMonth = new Date().getMonth();
    const last6MonthsLabels = [];
    const last6MonthsData = [];

    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      if (m < 0) m += 12;
      last6MonthsLabels.push(months[m]);
      last6MonthsData.push(data[m]);
    }

    return {
      labels: last6MonthsLabels,
      datasets: [{ data: last6MonthsData }]
    };
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <View>
          <Text style={styles.headerTitle}>Chủ sân</Text>
          <Text style={[styles.headerSubtitle, darkMode && { color: "#A7F3D0" }]}>
            Chào mừng trở lại, {user?.full_name}
          </Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Text style={styles.avatarText}>{user?.full_name?.[0]}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
        ) : stats ? (
          <>
            <View style={styles.grid}>
              <Card
                title="Lượt đặt sân"
                value={stats.total_bookings}
                icon="calendar"
                color="#3B82F6"
              />
              <Card
                title="Doanh thu"
                value={`${stats.total_revenue?.toLocaleString('vi-VN')}đ`}
                icon="cash"
                color="#22C55E"
              />
              <Card
                title="Sân hoạt động"
                value={stats.total_fields}
                icon="football"
                color="#F59E0B"
              />
              <Card
                title="Sân HOT nhất"
                value={stats.top_field?.field_name || "N/A"}
                icon="trending-up"
                color="#8B5CF6"
              />
            </View>

            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Thống kê doanh thu (Triệu VNĐ)</Text>
            <View style={[styles.chartContainer, darkMode && { backgroundColor: "#1F2937" }]}>
              <LineChart
                data={getChartData()}
                width={screenWidth - 72}
                height={200}
                chartConfig={{
                  backgroundColor: darkMode ? "#1F2937" : "#fff",
                  backgroundGradientFrom: darkMode ? "#1F2937" : "#fff",
                  backgroundGradientTo: darkMode ? "#1F2937" : "#fff",
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  labelColor: (opacity = 1) => darkMode ? `rgba(156, 163, 175, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#22C55E"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>

            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Hành động nhanh</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={[styles.actionItem, darkMode && { backgroundColor: "#1F2937" }]}>
                <Ionicons name="add-circle" size={32} color="#22C55E" />
                <Text style={[styles.actionLabel, darkMode && { color: "#fff" }]}>Thêm sân mới</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionItem, darkMode && { backgroundColor: "#1F2937" }]}>
                <Ionicons name="notifications" size={32} color="#3B82F6" />
                <Text style={[styles.actionLabel, darkMode && { color: "#fff" }]}>Gửi thông báo</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 50, color: darkMode ? '#9CA3AF' : '#64748B' }}>
            Không tải được dữ liệu
          </Text>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#DCFCE7', marginTop: 4 },
  profileBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#22C55E' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  card: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    ...getShadow(0.05, 10, 3),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 30, marginBottom: 15 },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    ...getShadow(0.05, 10, 3),
  },
  actionGrid: { flexDirection: 'row', gap: 15 },
  actionItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    ...getShadow(0.05, 10, 3),
  },
  actionLabel: { marginTop: 10, fontWeight: '600', fontSize: 14, color: '#1E293B' },
});
