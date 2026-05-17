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

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      {/* HEADER */}
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
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
            <View style={styles.grid}>
              <Card title="Doanh thu hôm nay" value={`${(stats.today_revenue || 0).toLocaleString()}đ`} icon="cash" color="#22C55E" />
              <Card title="Đơn đặt hôm nay" value={stats.today_bookings || 0} icon="calendar" color="#3B82F6" />
              <Card title="Đang chờ duyệt" value={stats.pending_bookings || 0} icon="time" color="#F59E0B" />
              <Card title="Sân hoạt động" value={stats.active_fields || 0} icon="football" color="#8B5CF6" />
            </View>

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
                onPress={() => router.push("/owner/revenue" as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="pie-chart" size={24} color="#D97706" />
                </View>
                <Text style={[styles.actionLabel, darkMode && { color: "#fff" }]}>Báo cáo</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Đơn mới nhất</Text>
            {/* Sẽ map list booking gần đây ở đây */}
            <View style={[styles.emptyBox, darkMode && { backgroundColor: "#1F2937" }]}>
              <Text style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}>Chưa có đơn đặt mới</Text>
            </View>
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 24, marginBottom: 16 },
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
  actionLabel: { fontWeight: '600', fontSize: 13, color: '#1E293B' },
  emptyBox: {
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadow(0.05, 10, 3),
  }
});
