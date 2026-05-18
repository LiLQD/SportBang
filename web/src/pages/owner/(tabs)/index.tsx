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
import { useFocusEffect, router } from "expo-router";
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

  const getChartData = () => {
    if (!stats?.monthly_revenue || stats.monthly_revenue.length === 0) {
      return {
        labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
        datasets: [{ data: [0, 0, 0, 0, 0, 0] }]
      };
    }

    // Lấy 6 tháng gần nhất hoặc fill dữ liệu
    const labels = stats.monthly_revenue.map((item: any) => `T${item.month}`);
    const data = stats.monthly_revenue.map((item: any) => item.revenue / 1000000); // Đơn vị triệu đồng

    return {
      labels,
      datasets: [{ data }]
    };
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      {/* HEADER */}
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <View>
          <Text style={styles.headerTitle}>Tổng quan</Text>
          <Text style={[styles.headerSubtitle, darkMode && { color: "#A7F3D0" }]}>
            Chào, {user?.full_name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push("/owner/notifications" as any)}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={styles.badge} />
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
            {/* THỐNG KÊ NHANH */}
            <View style={styles.grid}>
              <Card title="Doanh thu hôm nay" value={`${(stats.today_revenue || 0).toLocaleString()}đ`} icon="cash" color="#22C55E" />
              <Card title="Đơn đặt hôm nay" value={stats.today_bookings || 0} icon="calendar" color="#3B82F6" />
              <Card title="Đang chờ duyệt" value={stats.pending_bookings || 0} icon="time" color="#F59E0B" />
              <Card title="Sân hoạt động" value={stats.active_fields || 0} icon="football" color="#8B5CF6" />
            </View>

            {/* TỔNG DOANH THU */}
            <View style={[styles.mainCard, darkMode && { backgroundColor: "#1F2937" }, { marginTop: 20 }]}>
              <Text style={[styles.mainCardLabel, darkMode && { color: "#9CA3AF" }]}>Tổng doanh thu (Tất cả thời gian)</Text>
              <Text style={[styles.mainCardValue, darkMode && { color: "#fff" }]}>
                {(stats?.total_revenue || 0).toLocaleString()}đ
              </Text>
              <View style={styles.trendRow}>
                <Ionicons name="stats-chart" size={16} color="#22C55E" />
                <Text style={styles.trendText}>Tổng {stats?.total_bookings || 0} đơn đặt thành công</Text>
              </View>
            </View>

            {/* BIỂU ĐỒ */}
            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Biểu đồ doanh thu (Triệu VNĐ)</Text>
            <View style={[styles.chartBox, darkMode && { backgroundColor: "#1F2937" }]}>
              <LineChart
                data={getChartData()}
                width={screenWidth - 72}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>

            {/* HÀNH ĐỘNG NHANH */}
            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Hành động nhanh</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={[styles.actionItem, darkMode && { backgroundColor: "#1F2937" }]}
                onPress={() => router.push("/owner/bookings" as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="list" size={24} color="#0EA5E9" />
                </View>
                <Text style={[styles.actionLabel, darkMode && { color: "#fff" }]}>Duyệt đơn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, darkMode && { backgroundColor: "#1F2937" }]}
                onPress={() => router.push("/owner/add-field" as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="add" size={24} color="#22C55E" />
                </View>
                <Text style={[styles.actionLabel, darkMode && { color: "#fff" }]}>Thêm sân</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, darkMode && { backgroundColor: "#1F2937" }]}
                onPress={() => router.push("/owner/fields" as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="football" size={24} color="#D97706" />
                </View>
                <Text style={[styles.actionLabel, darkMode && { color: "#fff" }]}>Quản lý sân</Text>
              </TouchableOpacity>
            </View>

            {/* SÂN NỔI BẬT */}
            {stats.top_field && (
              <>
                <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Sân hiệu quả nhất</Text>
                <View style={[styles.topFieldCard, darkMode && { backgroundColor: "#1F2937" }]}>
                  <View style={styles.topFieldIcon}>
                    <Ionicons name="trophy" size={30} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={[styles.topFieldName, darkMode && { color: "#fff" }]}>{stats.top_field.field_name}</Text>
                    <Text style={styles.topFieldStats}>{stats.top_field.total_bookings} đơn đặt sân</Text>
                  </View>
                </View>
              </>
            )}

            <View style={{ height: 30 }} />
          </>
        ) : null}
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#DCFCE7', marginTop: 4 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
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
  cardValue: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    ...getShadow(0.05, 10, 3),
  },
  mainCardLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  mainCardValue: { fontSize: 24, fontWeight: 'bold', color: '#22C55E' },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 },
  trendText: { color: '#64748B', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 24, marginBottom: 16 },
  chartBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    ...getShadow(0.05, 10, 3),
  },
  chart: { marginVertical: 8, borderRadius: 16 },
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...getShadow(0.05, 10, 3),
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: { fontWeight: '600', fontSize: 12, color: '#1E293B', textAlign: 'center' },
  topFieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    gap: 15,
    ...getShadow(0.05, 10, 3),
  },
  topFieldIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  topFieldName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  topFieldStats: { fontSize: 14, color: '#64748B', marginTop: 2 }
});
