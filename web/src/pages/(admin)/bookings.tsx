import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { adminService } from "@/src/services/admin.service";
import { useAuthStore } from "@/src/store/auth.store";
import { getShadow } from "@/src/utils/style";

type Status = "pending" | "confirmed" | "completed" | "cancelled";

export default function AdminBookings() {
  const { darkMode } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await adminService.getAllBookings();
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSearch =
        b.user_id?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.field_id?.field_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(b.booking_date).toLocaleDateString().includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "pending": return { bg: "#FEF3C7", text: "#92400E", label: "Chờ duyệt" };
      case "confirmed": return { bg: "#DBEAFE", text: "#1E40AF", label: "Đã xác nhận" };
      case "completed": return { bg: "#DCFCE7", text: "#166534", label: "Hoàn thành" };
      case "cancelled": return { bg: "#FEE2E2", text: "#991B1B", label: "Đã hủy" };
      default: return { bg: "#F1F5F9", text: "#64748B", label: s };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const status = getStatusStyle(item.status);
    return (
      <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>{item.field_id?.field_name || "N/A"}</Text>
            <Text style={styles.customerName}>Khách: <Text style={{fontWeight: '600'}}>{item.user_id?.full_name || "Unknown"}</Text></Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#64748B" />
            <Text style={styles.detailText}>{new Date(item.booking_date).toLocaleDateString('vi-VN')}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.detailText}>{item.booking_slot?.start} - {item.booking_slot?.end}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={14} color="#16a34a" />
            <Text style={[styles.detailText, {color: '#16a34a', fontWeight: 'bold'}]}>{item.total_price.toLocaleString()}đ</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      {/* SEARCH & FILTER */}
      <View style={styles.filterContainer}>
        <View style={[styles.searchBar, darkMode && { backgroundColor: "#1F2937", borderColor: "#374151" }]}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            placeholder="Tìm theo tên khách, sân hoặc ngày..."
            placeholderTextColor="#94A3B8"
            style={[styles.searchInput, darkMode && { color: "#fff" }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatusFilter(s as any)}
              style={[
                styles.statusBtn,
                darkMode && { backgroundColor: "#1F2937", borderColor: "#374151" },
                statusFilter === s && styles.activeBtn,
              ]}
            >
              <Text style={[styles.statusBtnText, statusFilter === s && styles.activeBtnText]}>
                {s === 'all' ? 'Tất cả' : getStatusStyle(s).label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
        }
        ListEmptyComponent={
          loading ? null : <Text style={styles.emptyText}>Không tìm thấy đơn đặt nào</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  filterContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  statusScroll: { marginTop: 12, flexDirection: 'row' },
  statusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  activeBtn: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  statusBtnText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  activeBtnText: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...getShadow(0.05, 10, 3),
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  fieldName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  customerName: { fontSize: 13, color: '#64748B', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  detailsRow: { flexDirection: 'row', marginTop: 16, gap: 12, flexWrap: 'wrap' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 13, color: '#64748B' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94A3B8' }
});
