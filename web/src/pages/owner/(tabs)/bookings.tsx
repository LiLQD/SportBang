import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { ownerService } from "@/src/services/owner.service";
import { getShadow } from "@/src/utils/style";

export default function BookingsList() {
  const { darkMode } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchBookings = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await ownerService.getBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  const renderBookingItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.bookingCard, darkMode && { backgroundColor: "#1F2937" }]}
      onPress={() => router.push(`/owner/booking-detail/${item._id || item.id}` as any)}
    >
      <View style={styles.bookingLeft}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{new Date(item.booking_date).getDate()}</Text>
          <Text style={styles.dateMonth}>Th{new Date(item.booking_date).getMonth() + 1}</Text>
        </View>
      </View>
      <View style={styles.bookingRight}>
        <View style={styles.bookingHeader}>
          <Text style={[styles.userName, darkMode && { color: "#fff" }]}>
            {item.user_id?.full_name || item.user_name || "Khách"}
          </Text>
          <Text style={styles.bookingPrice}>{item.total_price?.toLocaleString()}đ</Text>
        </View>
        <Text style={styles.fieldName}>{item.field_id?.field_name || item.field_name}</Text>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.timeText}>
            {item.booking_slot?.start || item.start_time} - {item.booking_slot?.end || item.end_time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <Text style={styles.headerTitle}>Quản lý đơn đặt</Text>
      </View>

      <View style={[styles.tabBar, darkMode && { backgroundColor: "#1F2937" }]}>
        {['pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
              darkMode && activeTab !== tab && { color: "#9CA3AF" }
            ]}>
              {tab === 'pending' ? 'Chờ' : tab === 'confirmed' ? 'Duyệt' : tab === 'completed' ? 'Xong' : 'Hủy'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#22C55E"]}
              tintColor={darkMode ? "#fff" : "#22C55E"}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}>Không có đơn đặt nào</Text>
            </View>
          }
        />
      )}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: '#DCFCE7',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#22C55E',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 12,
    ...getShadow(0.05, 10, 3),
  },
  bookingLeft: { marginRight: 15 },
  dateBox: {
    width: 50,
    height: 55,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  dateMonth: { fontSize: 12, color: '#64748B' },
  bookingRight: { flex: 1 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  bookingPrice: { fontSize: 15, fontWeight: 'bold', color: '#22C55E' },
  fieldName: { fontSize: 14, color: '#64748B', marginTop: 2 },
  timeInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  timeText: { fontSize: 13, color: '#64748B' },
  emptyContainer: { alignItems: 'center', marginTop: 100 }
});
