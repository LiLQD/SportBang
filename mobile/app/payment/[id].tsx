import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { paymentService } from "@/src/services/payment.service";
import { getShadow } from "@/src/utils/style";

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { darkMode } = useAuthStore();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentDetail();
  }, [id]);

  const fetchPaymentDetail = async () => {
    try {
      const res = await paymentService.getMyPayments();
      if (res && res.data) {
        const found = res.data.find((p: any) => p._id === id);
        setPayment(found);
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method: string) => {
    try {
      setProcessing(true);

      if (method === 'Tiền mặt') {
        await paymentService.updatePaymentStatus(id as string, 'pending');
        const msg = "Đã ghi nhận yêu cầu thanh toán tại sân. Vui lòng thanh toán khi đến nhận sân!";
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert("Thành công", msg);
        router.replace("/(user)/payments");
        return;
      }

      // Đối với MoMo/VNPAY/Banking: Gọi lại API createPayment để lấy payment_url
      // Lưu ý: Ở đây ta cập nhật phương thức thanh toán trước
      const methodKey = method.toLowerCase();

      // Thử lấy payment_url từ API createPayment (nếu backend cho phép update hoặc tạo mới)
      // Nhưng theo logic hiện tại, ta sẽ dùng URL mô phỏng trực tiếp từ ID và phương thức

      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const simulateUrl = `${baseUrl}/api/payments/simulate/${id}?method=${methodKey}`;

      if (Platform.OS === 'web') {
        window.open(simulateUrl, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(simulateUrl);
      }

      // Sau khi quay lại, tải lại dữ liệu
      fetchPaymentDetail();

    } catch (error: any) {
      const errorMsg = error.message || "Thanh toán thất bại. Vui lòng thử lại.";
      if (Platform.OS === 'web') window.alert(errorMsg);
      else Alert.alert("Lỗi", errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, darkMode && { backgroundColor: "#111827" }]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={[styles.centered, darkMode && { backgroundColor: "#111827" }]}>
        <Text style={darkMode && { color: "#fff" }}>Không tìm thấy thông tin thanh toán</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      {/* HEADER */}
      <View style={[styles.header, darkMode && { borderBottomColor: "#1F2937" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#fff" : "#111827"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && { color: "#fff" }]}>Thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* SUMMARY CARD */}
        <View style={[styles.summaryCard, darkMode && { backgroundColor: "#1F2937" }]}>
          <Text style={[styles.summaryLabel, darkMode && { color: "#9CA3AF" }]}>Số tiền cần thanh toán</Text>
          <Text style={styles.amountText}>{payment.amount?.toLocaleString('vi-VN')}đ</Text>

          <View style={[styles.divider, darkMode && { backgroundColor: "#374151" }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, darkMode && { color: "#9CA3AF" }]}>Sân:</Text>
            <Text style={[styles.infoValue, darkMode && { color: "#fff" }]}>{payment.booking_id?.field_id?.field_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, darkMode && { color: "#9CA3AF" }]}>Mã đặt sân:</Text>
            <Text style={[styles.infoValue, darkMode && { color: "#fff" }]}>#{payment.booking_id?._id.slice(-8).toUpperCase()}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Chọn phương thức thanh toán</Text>

        <TouchableOpacity
          style={[styles.methodBtn, darkMode && { backgroundColor: "#1F2937" }]}
          onPress={() => handlePayment("MoMo")}
          disabled={processing}
        >
          <View style={[styles.methodIcon, { backgroundColor: "#A50064" }]}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>M</Text>
          </View>
          <Text style={[styles.methodText, darkMode && { color: "#fff" }]}>Ví MoMo</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodBtn, darkMode && { backgroundColor: "#1F2937" }]}
          onPress={() => handlePayment("Banking")}
          disabled={processing}
        >
          <View style={[styles.methodIcon, { backgroundColor: "#3B82F6" }]}>
            <Ionicons name="card" size={20} color="#fff" />
          </View>
          <Text style={[styles.methodText, darkMode && { color: "#fff" }]}>Thẻ ngân hàng / Banking</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodBtn, darkMode && { backgroundColor: "#1F2937" }]}
          onPress={() => handlePayment("Tiền mặt")}
          disabled={processing}
        >
          <View style={[styles.methodIcon, { backgroundColor: "#22C55E" }]}>
            <Ionicons name="cash" size={20} color="#fff" />
          </View>
          <Text style={[styles.methodText, darkMode && { color: "#fff" }]}>Thanh toán tại sân (Tiền mặt)</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>

      {processing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.overlayText}>Đang xử lý giao dịch...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    ...getShadow(0.1, 15, 5),
  },
  summaryLabel: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  amountText: { fontSize: 36, fontWeight: 'bold', color: '#22C55E' },
  divider: { width: '100%', height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  infoLabel: { fontSize: 15, color: '#64748B' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...getShadow(0.05, 5, 2),
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1E293B' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayText: { color: '#fff', marginTop: 15, fontSize: 16, fontWeight: '600' },
});
