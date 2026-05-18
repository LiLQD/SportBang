import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { bookingService } from "@/src/services/booking.service";
import { getShadow } from "@/src/utils/style";

export default function OwnerBookingDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { darkMode } = useAuthStore();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookingById(id as string);
      if (res.success) {
        setBooking(res.data);
      }
    } catch (error: any) {
      console.error("Fetch booking detail error:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đơn đặt");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      setLoading(true);
      const res = await bookingService.updateBookingStatus(id as string, status);
      if (res.success) {
        Alert.alert("Thành công", `Đã cập nhật trạng thái đơn đặt sang: ${getStatusText(status)}`);
        fetchBookingDetail();
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#EAB308';
      case 'confirmed': return '#22C55E';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, darkMode && { backgroundColor: "#111827" }]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.centered, darkMode && { backgroundColor: "#111827" }]}>
        <Text style={[styles.errorText, darkMode && { color: "#94A3B8" }]}>Không tìm thấy đơn đặt</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Status Card */}
        <View style={[styles.statusCard, darkMode && { backgroundColor: "#1F2937" }]}>
          <Text style={[styles.label, darkMode && { color: "#94A3B8" }]}>Trạng thái đơn hàng</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {getStatusText(booking.status)}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={[styles.section, darkMode && { backgroundColor: "#1F2937" }]}>
          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Thông tin khách hàng</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#64748B" />
            <Text style={[styles.infoValue, darkMode && { color: "#CBD5E1" }]}>{booking.user_id?.full_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#64748B" />
            <Text style={[styles.infoValue, darkMode && { color: "#CBD5E1" }]}>{booking.user_id?.phone || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#64748B" />
            <Text style={[styles.infoValue, darkMode && { color: "#CBD5E1" }]}>{booking.user_id?.email}</Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={[styles.section, darkMode && { backgroundColor: "#1F2937" }]}>
          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Chi tiết đặt sân</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, darkMode && { color: "#94A3B8" }]}>Sân bóng:</Text>
            <Text style={[styles.detailValue, darkMode && { color: "#fff" }]}>{booking.field_id?.field_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, darkMode && { color: "#94A3B8" }]}>Ngày đặt:</Text>
            <Text style={[styles.detailValue, darkMode && { color: "#fff" }]}>
              {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, darkMode && { color: "#94A3B8" }]}>Thời gian:</Text>
            <Text style={[styles.detailValue, darkMode && { color: "#fff" }]}>
              {booking.booking_slot?.start} - {booking.booking_slot?.end}
            </Text>
          </View>
          <View style={[styles.divider, darkMode && { backgroundColor: "#374151" }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.totalLabel, darkMode && { color: "#fff" }]}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{booking.total_price?.toLocaleString()}đ</Text>
          </View>
        </View>

        {/* Actions - For demo purpose, we could add confirm/cancel for owner here */}
        {booking.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => handleUpdateStatus('confirmed')}>
              <Text style={styles.btnText}>Xác nhận đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => handleUpdateStatus('cancelled')}>
              <Text style={styles.cancelBtnText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        )}

        {booking.status === 'confirmed' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => handleUpdateStatus('completed')}>
              <Text style={styles.btnText}>Hoàn thành đơn</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  centered: { justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#22C55E",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backBtn: { padding: 4 },
  content: { padding: 20 },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    ...getShadow(0.05, 10, 2)
  },
  label: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontWeight: '700', fontSize: 15 },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    ...getShadow(0.05, 10, 2)
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  infoValue: { fontSize: 15, color: '#475569' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 14, color: '#64748B' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#22C55E' },
  actions: { gap: 12, marginTop: 10 },
  confirmBtn: { backgroundColor: '#22C55E', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  cancelBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
  errorText: { fontSize: 16, color: '#64748B' }
});
