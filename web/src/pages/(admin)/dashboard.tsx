import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LineChart } from "react-native-chart-kit";

import { useAuthStore } from "@/src/store/auth.store";
import { adminService } from "@/src/services/admin.service";
import { useEffect, useState, useCallback } from "react";
import { getShadow } from "@/src/utils/style";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const { darkMode, logout } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await logout();
        router.replace("/(auth)/login");
      } catch (err) {
        console.error("Logout error:", err);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        await performLogout();
      }
    } else {
      Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: performLogout },
      ]);
    }
  };

  const [stats, setStats] = useState<any>({
    total_bookings: 0,
    total_revenue: 0,
    total_users: 0,
    total_fields: 0,
    monthly_revenue: [],
    top_fields: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await adminService.getDashboard();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const getChartData = () => {
    if (!stats.monthly_revenue || stats.monthly_revenue.length === 0) {
      return {
        labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
        datasets: [{ data: [0, 0, 0, 0, 0, 0] }]
      };
    }

    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const data = new Array(12).fill(0);

    stats.monthly_revenue.forEach((item: any) => {
      if (item.month >= 1 && item.month <= 12) {
        data[item.month - 1] = item.revenue / 1000000;
      }
    });

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
      {/* HEADER */}
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <View>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={[styles.subtitle, darkMode && { color: "#A7F3D0" }]}>
            Quản trị viên: {user?.full_name}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* KPI GRID (2x2) */}
            <View style={styles.grid}>
              <Card title="Tổng Đơn" value={stats.total_bookings || 0} icon="calendar" color="#3B82F6" darkMode={darkMode} />
              <Card title="Doanh Thu" value={`${((stats.total_revenue || 0) / 1000000).toFixed(1)}M`} icon="cash" color="#10B981" darkMode={darkMode} />
              <Card title="Người dùng" value={stats.total_users || 0} icon="people" color="#F59E0B" darkMode={darkMode} />
              <Card title="Tổng Sân" value={stats.total_fields || 0} icon="football" color="#8B5CF6" darkMode={darkMode} />
            </View>

            {/* CHART */}
            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Doanh thu hệ thống (Triệu VNĐ)</Text>
            <View style={[styles.chartBox, darkMode && { backgroundColor: "#1F2937" }]}>
              <LineChart
                data={getChartData()}
                width={screenWidth - 72}
                height={180}
                chartConfig={{
                  backgroundColor: darkMode ? "#1F2937" : "#fff",
                  backgroundGradientFrom: darkMode ? "#1F2937" : "#fff",
                  backgroundGradientTo: darkMode ? "#1F2937" : "#fff",
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
                  labelColor: (opacity = 1) => darkMode ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "4", strokeWidth: "2", stroke: "#16a34a" }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
              />
            </View>

            {/* QUICK ACTIONS */}
            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Hành động nhanh</Text>
            <View style={styles.actionGrid}>
              <ActionItem
                title="Người dùng"
                icon="people"
                color="#F59E0B"
                onPress={() => router.push("/(admin)/users")}
                darkMode={darkMode}
              />
              <ActionItem
                title="Sân bóng"
                icon="football"
                color="#8B5CF6"
                onPress={() => router.push("/(admin)/fields")}
                darkMode={darkMode}
              />
              <ActionItem
                title="Đơn đặt"
                icon="list"
                color="#3B82F6"
                onPress={() => router.push("/(admin)/bookings")}
                darkMode={darkMode}
              />
            </View>

            {/* TOP FIELDS */}
            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Top sân hiệu quả</Text>
            <View style={[styles.topFieldsBox, darkMode && { backgroundColor: "#1F2937" }]}>
              {stats.top_fields && stats.top_fields.length > 0 ? (
                stats.top_fields.map((f: any, i: number) => (
                  <View key={i} style={[styles.topFieldItem, i < stats.top_fields.length - 1 && styles.borderBottom]}>
                    <View style={styles.topFieldRank}>
                      <Text style={{ fontWeight: 'bold', color: i === 0 ? '#F59E0B' : '#6B7280' }}>#{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.topFieldName, darkMode && { color: "#fff" }]}>{f.field_name}</Text>
                      <Text style={styles.topFieldStats}>{f.count} đơn - {(f.revenue || 0).toLocaleString()}đ</Text>
                    </View>
                    <Ionicons name="trending-up" size={20} color="#10B981" />
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: 'center', padding: 20, color: '#9CA3AF' }}>Chưa có dữ liệu</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* COMPONENTS */

const Card = ({ title, value, icon, color, darkMode }: any) => (
  <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.cardTitle, darkMode && { color: "#64748B" }]}>{title}</Text>
    <Text style={[styles.cardValue, darkMode && { color: "#fff" }]}>{value}</Text>
  </View>
);

const ActionItem = ({ title, icon, color, onPress, darkMode }: any) => (
  <TouchableOpacity
    style={[styles.actionItem, darkMode && { backgroundColor: "#1F2937" }]}
    onPress={onPress}
  >
    <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.actionLabel, darkMode && { color: "#fff" }]}>{title}</Text>
  </TouchableOpacity>
);

/* STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#16a34a",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  subtitle: { color: "#d1fae5", fontSize: 13, marginTop: 4 },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    width: '48%',
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    ...getShadow(0.05, 10, 3),
  },
  iconCircle: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 12, color: "#64748B", marginBottom: 4, fontWeight: '500' },
  cardValue: { fontSize: 18, fontWeight: "bold", color: '#1E293B' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 24, marginBottom: 16, paddingHorizontal: 20 },
  chartBox: { backgroundColor: "#fff", marginHorizontal: 20, padding: 16, borderRadius: 20, alignItems: "center", ...getShadow(0.05, 10, 3) },
  actionGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
  actionItem: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 16, alignItems: 'center', ...getShadow(0.05, 10, 3) },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontWeight: '600', fontSize: 12, color: '#1E293B', textAlign: 'center' },
  topFieldsBox: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 10, ...getShadow(0.05, 10, 3) },
  topFieldItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  topFieldRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  topFieldName: { fontWeight: 'bold', fontSize: 15, color: '#1E293B' },
  topFieldStats: { fontSize: 12, color: '#64748B', marginTop: 2 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }
});
