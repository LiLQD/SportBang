import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { paymentService } from "@/src/services/payment.service";
import { getShadow } from "@/src/utils/style";
import { useAuthStore } from "@/src/store/auth.store";
import { Toast, ToastType } from "@/src/components/Toast";

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { darkMode } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const fetchPayments = async () => {
    try {
      const res = await paymentService.getMyPayments();
      if (res && res.data) {
        setPayments(res.data);
      }
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      showToast(error.message || "Không thể tải lịch sử thanh toán", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'refunded': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const renderPaymentItem = ({ item }: { item: any }) => {
    const isCash = item.payment_method?.toLowerCase() === 'cash';
    const isConfirmed = item.booking_id?.status === 'confirmed';
    const isPending = item.payment_status === 'pending';

    return (
      <View style={[styles.paymentCard, darkMode && { backgroundColor: "#1F2937" }]}>
        <View style={styles.cardHeader}>
          <View style={styles.fieldInfo}>
            <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>{item.booking_id?.field_id?.field_name || "Sport Field"}</Text>
            <Text style={[styles.date, darkMode && { color: "#9CA3AF" }]}>{new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.payment_status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.payment_status) }]}>
              {isCash && isPending && isConfirmed ? "CHỜ TẠI SÂN" : item.payment_status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, darkMode && { backgroundColor: "#374151" }]} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, darkMode && { color: "#9CA3AF" }]}>Mã giao dịch:</Text>
            <Text style={[styles.infoValue, darkMode && { color: "#D1D5DB" }]}>#{item._id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, darkMode && { color: "#9CA3AF" }]}>Phương thức:</Text>
            <Text style={[styles.infoValue, darkMode && { color: "#D1D5DB" }]}>
              {isCash ? "Tiền mặt tại sân" : item.payment_method?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, darkMode && { color: "#9CA3AF" }]}>Trạng thái đơn:</Text>
            <Text style={[styles.infoValue, { color: isConfirmed ? '#22C55E' : '#64748B', fontWeight: 'bold' }]}>
              {item.booking_id?.status?.toUpperCase() || "N/A"}
            </Text>
          </View>
        </View>

        <View style={[styles.cardFooter, darkMode && { borderTopColor: "#374151" }]}>
          <View>
            <Text style={[styles.amountLabel, darkMode && { color: "#fff" }]}>Tổng cộng</Text>
            <Text style={styles.amountValue}>{item.amount?.toLocaleString('vi-VN')}đ</Text>
          </View>
          {isPending && !(isCash && isConfirmed) && (
            <TouchableOpacity
              style={styles.payNowBtn}
              onPress={() => router.push(`/payment/${item._id}`)}
            >
              <Text style={styles.payNowText}>Thanh toán ngay</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      {/* HEADER */}
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Lịch sử thanh toán</Text>
          <Text style={[styles.headerSubtitle, darkMode && { color: "#A7F3D0" }]}>Quản lý các giao dịch của bạn</Text>
        </View>
      </View>

      <View style={[styles.content, darkMode && { backgroundColor: '#111827' }]}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={payments}
            keyExtractor={(item) => item._id}
            renderItem={renderPaymentItem}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={80} color={darkMode ? "#1F2937" : "#E2E8F0"} />
                <Text style={[styles.emptyText, darkMode && { color: "#9CA3AF" }]}>Bạn chưa có giao dịch nào</Text>
              </View>
            }
          />
        )}
      </View>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
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
    paddingBottom: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#DCFCE7' },
  content: { flex: 1, marginTop: -20, backgroundColor: '#F8FAFC', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...getShadow(0.05, 10, 5),
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  fieldInfo: { flex: 1 },
  fieldName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  date: { fontSize: 13, color: '#64748B', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },
  cardBody: { marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: '#64748B', fontSize: 14 },
  infoValue: { color: '#1E293B', fontWeight: '500', fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  amountLabel: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  amountValue: { fontSize: 20, fontWeight: 'bold', color: '#22C55E' },
  payNowBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  payNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#64748B', marginTop: 15 },
});
