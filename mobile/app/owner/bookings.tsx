import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { ownerService } from "@/src/services/owner.service";
import { paymentService } from "@/src/services/payment.service";
import { bookingService } from "@/src/services/booking.service";
import { getShadow } from "@/src/utils/style";

export default function OwnerBookingsScreen() {
  const { darkMode } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, paymentsRes] = await Promise.all([
        ownerService.getBookings(),
        paymentService.getMyPayments(),
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
      }

      if (paymentsRes.success) {
        // Map payment to booking_id for quick lookup
        const paymentMap: Record<string, any> = {};
        paymentsRes.data.forEach((p: any) => {
          if (p.booking_id?._id) {
            paymentMap[p.booking_id._id] = p;
          } else if (typeof p.booking_id === 'string') {
            paymentMap[p.booking_id] = p;
          }
        });
        setPayments(paymentMap);
      }
    } catch (error: any) {
      console.error("Error fetching owner data:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải danh sách đặt sân");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleConfirmPayment = async (bookingId: string) => {
    const payment = payments[bookingId];
    if (!payment) {
      Alert.alert("Thông báo", "Không tìm thấy thông tin thanh toán cho đơn này");
      return;
    }

    try {
      const res = await paymentService.updatePaymentStatus(payment._id, 'paid');
      if (res.success) {
        Alert.alert("Thành công", "Đã xác nhận thanh toán");
        fetchData();
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await bookingService.updateBookingStatus(bookingId, status);
      if (res.success) {
        Alert.alert("Thành công", `Đã ${status === 'confirmed' ? 'xác nhận' : 'từ chối'} đặt sân`);
        fetchData();
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật trạng thái");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      case 'completed': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'refunded': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => {
    const payment = payments[item._id];

    return (
      <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.userName, darkMode && { color: "#fff" }]}>{item.user_id?.full_name || 'Khách lẻ'}</Text>
            <Text style={[styles.userPhone, darkMode && { color: "#9CA3AF" }]}>{item.user_id?.phone || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.divider, darkMode && { backgroundColor: "#374151" }]} />

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="football" size={16} color="#22C55E" />
            <Text style={[styles.detailText, darkMode && { color: "#D1D5DB" }]}>{item.field_id?.field_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#22C55E" />
            <Text style={[styles.detailText, darkMode && { color: "#D1D5DB" }]}>
              {new Date(item.booking_date).toLocaleDateString('vi-VN')} | {item.booking_slot.start} - {item.booking_slot.end}
            </Text>
          </View>
          {payment && (
            <View style={styles.detailRow}>
              <Ionicons name="card" size={16} color="#22C55E" />
              <Text style={[styles.detailText, darkMode && { color: "#D1D5DB" }]}>
                Thanh toán: <Text style={{ color: getPaymentStatusColor(payment.payment_status), fontWeight: 'bold' }}>
                  {payment.payment_status === 'paid' ? 'Đã trả' : 'Chưa trả'} ({payment.payment_method})
                </Text>
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.priceLabel, darkMode && { color: "#9CA3AF" }]}>Tổng tiền:</Text>
          <Text style={styles.priceValue}>{item.total_price.toLocaleString('vi-VN')}đ</Text>
        </View>

        <View style={styles.actions}>
          {item.status === 'pending' && (
            <>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleUpdateBookingStatus(item._id, 'cancelled')}
              >
                <Text style={styles.rejectText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => handleUpdateBookingStatus(item._id, 'confirmed')}
              >
                <Text style={styles.confirmText}>Xác nhận</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'confirmed' && payment && payment.payment_status !== 'paid' && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => handleConfirmPayment(item._id)}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 5 }} />
              <Text style={styles.confirmText}>Xác nhận đã thu tiền</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <Text style={styles.headerTitle}>Quản lý đặt sân</Text>
        <Text style={[styles.headerSubtitle, darkMode && { color: "#A7F3D0" }]}>Danh sách khách hàng đã đặt</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={80} color={darkMode ? "#1F2937" : "#E2E8F0"} />
              <Text style={[styles.emptyText, darkMode && { color: "#9CA3AF" }]}>Chưa có lượt đặt sân nào</Text>
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
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#DCFCE7', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...getShadow(0.05, 10, 3),
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  userPhone: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  details: { gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, color: '#475569' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  priceLabel: { fontSize: 13, color: '#64748B' },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: '#22C55E' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 15 },
  confirmBtn: { flex: 1, backgroundColor: '#22C55E', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  payBtn: { flex: 1, backgroundColor: '#3B82F6', paddingVertical: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  confirmText: { color: '#fff', fontWeight: 'bold' },
  rejectBtn: { flex: 1, backgroundColor: '#FEE2E2', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  rejectText: { color: '#EF4444', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#64748B', marginTop: 15 },
});
