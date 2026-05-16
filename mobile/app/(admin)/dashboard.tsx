import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LineChart } from "react-native-chart-kit";

import { useAuthStore } from "@/src/store/auth.store";
import { adminService } from "@/src/services/admin.service";
import { useEffect, useState } from "react";

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
    monthly_revenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

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
    <ScrollView style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      {/* HEADER */}
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={[styles.subtitle, darkMode && { color: "#A7F3D0" }]}>
            Chào mừng, {user?.full_name || "Admin"}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={fetchStats}>
            <Ionicons name="refresh-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={{ color: "#16a34a", fontWeight: "bold" }}>
              {user?.full_name?.substring(0, 2).toUpperCase() || "AD"}
            </Text>
          </View>
        </View>
      </View>

      {/* KPI */}
      <View style={styles.grid}>
        <Card title="Bookings" value={stats.total_bookings} icon="calendar" darkMode={darkMode} />
        <Card title="Revenue" value={`${stats.total_revenue?.toLocaleString('vi-VN')}đ`} icon="cash" darkMode={darkMode} />
        <Card title="Users" value={stats.total_users} icon="people" darkMode={darkMode} />
        <Card title="Fields" value={stats.total_fields} icon="football" darkMode={darkMode} />
      </View>

      <Text style={[styles.section, darkMode && { color: "#fff" }]}>Hệ thống doanh thu (Triệu VNĐ)</Text>
      <View style={[styles.chartBox, darkMode && { backgroundColor: "#1F2937" }]}>
        <LineChart
          data={getChartData()}
          width={screenWidth - 40}
          height={180}
          chartConfig={{
            backgroundColor: darkMode ? "#1F2937" : "#fff",
            backgroundGradientFrom: darkMode ? "#1F2937" : "#fff",
            backgroundGradientTo: darkMode ? "#1F2937" : "#fff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
            labelColor: (opacity = 1) => darkMode ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "3", strokeWidth: "2", stroke: "#16a34a" }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>

      {/* QUICK ACTION */}
      <Text style={[styles.section, darkMode && { color: "#fff" }]}>Quick Actions</Text>

      <TouchableOpacity
        style={[styles.actionCard, darkMode && { backgroundColor: "#1F2937" }]}
        onPress={() => router.push("/(admin)/bookings")}
      >
        <Ionicons name="list" size={20} color="#16a34a" />
        <Text style={[styles.actionText, darkMode && { color: "#fff" }]}>Manage Bookings</Text>
        <Ionicons name="chevron-forward" size={18} color={darkMode ? "#9CA3AF" : "#111827"} />
      </TouchableOpacity>
    </ScrollView>
  );
}

/* COMPONENTS */

const Card = ({ title, value, icon, darkMode }: any) => (
  <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
    <Ionicons name={icon} size={20} color="#16a34a" />
    <Text style={[styles.cardTitle, darkMode && { color: "#9CA3AF" }]}>{title}</Text>
    <Text style={[styles.cardValue, darkMode && { color: "#fff" }]}>{value}</Text>
  </View>
);

const StatusBox = ({ label, value, color }: any) => (
  <View style={[styles.statusBox, { backgroundColor: color + "20" }]}>
    <Text style={{ color }}>{label}</Text>
    <Text style={[styles.statusValue, { color }]}>{value}</Text>
  </View>
);

/* STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    backgroundColor: "#16a34a",
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#d1fae5",
    fontSize: 12,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 35,
    height: 35,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
  },

  cardTitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5,
  },

  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  chartBox: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  section: {
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 10,
    fontWeight: "bold",
  },

  actionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
  },

  actionText: {
    flex: 1,
    fontWeight: "500",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },

  statusBox: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 10,
  },

  statusValue: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 5,
  },
});