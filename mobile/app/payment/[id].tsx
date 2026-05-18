import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { paymentService } from "@/src/services/payment.service";
import { getShadow } from "@/src/utils/style";

import * as WebBrowser from "expo-web-browser";

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { darkMode } = useAuthStore();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Card states
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  useEffect(() => {
    fetchPaymentDetail();
  }, [id]);

  const fetchPaymentDetail = async () => {
    try {
      const res = await paymentService.getPaymentById(id as string);
      if (res && res.success) {
        setPayment(res.data);
      } else {
        console.error("Payment not found in response");
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    try {
      setProcessing(true);
      await paymentService.updatePaymentStatus(id as string, 'pending');
      const msg = "Đã ghi nhận yêu cầu thanh toán tại sân. Vui lòng thanh toán khi đến nhận sân!";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Thành công", msg);
      router.replace("/(user)/payments");
    } catch (error: any) {
      const errorMsg = error.message || "Không thể cập nhật phương thức thanh toán.";
      if (Platform.OS === 'web') window.alert(errorMsg);
      else Alert.alert("Lỗi", errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    // Basic validation
    if (!cardHolder || cardHolder.length < 3) {
      Alert.alert("Lỗi", "Vui lòng nhập tên chủ thẻ hợp lệ");
      return;
    }
    if (cardNumber.length < 16) {
      Alert.alert("Lỗi", "Số thẻ phải đủ 16 chữ số");
      return;
    }
    if (!expiry.includes('/') || expiry.length < 5) {
      Alert.alert("Lỗi", "Định dạng ngày hết hạn không đúng (MM/YY)");
      return;
    }
    if (cvv.length < 3) {
      Alert.alert("Lỗi", "Mã CVV không hợp lệ");
      return;
    }

    try {
      setProcessing(true);

      // Giả lập xử lý thanh toán và cập nhật trạng thái trực tiếp
      // Vì là môi trường học tập/demo, ta gọi thẳng API update trạng thái sang 'paid'
      const res = await paymentService.updatePaymentStatus(id as string, 'paid');

      if (res && res.success) {
        const msg = "Thanh toán thành công! Đơn đặt sân của bạn đã được xác nhận.";
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert("Thành công", msg);

        router.replace("/(user)/payments");
      } else {
        throw new Error(res?.message || "Không thể cập nhật trạng thái thanh toán");
      }

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
        {/* HEADER */}
        <View style={[styles.header, darkMode && { backgroundColor: "#1F2937", borderBottomColor: "#374151" }]}>
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

          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Phương thức thanh toán</Text>

          {/* Cash Option */}
          <TouchableOpacity
            style={[
              styles.methodBtn,
              darkMode && { backgroundColor: "#1F2937" },
              !showCardForm && styles.selectedMethod
            ]}
            onPress={() => {
              setShowCardForm(false);
              handleCashPayment();
            }}
            disabled={processing}
          >
            <View style={[styles.methodIcon, { backgroundColor: "#22C55E" }]}>
              <Ionicons name="cash" size={20} color="#fff" />
            </View>
            <Text style={[styles.methodText, darkMode && { color: "#fff" }]}>Thanh toán tại sân (Tiền mặt)</Text>
            {!showCardForm && <Ionicons name="checkmark-circle" size={24} color="#22C55E" />}
          </TouchableOpacity>

          {/* Card Option Toggle */}
          <TouchableOpacity
            style={[
              styles.methodBtn,
              darkMode && { backgroundColor: "#1F2937" },
              showCardForm && styles.selectedMethod
            ]}
            onPress={() => setShowCardForm(!showCardForm)}
            disabled={processing}
          >
            <View style={[styles.methodIcon, { backgroundColor: "#3B82F6" }]}>
              <Ionicons name="card" size={20} color="#fff" />
            </View>
            <Text style={[styles.methodText, darkMode && { color: "#fff" }]}>Thanh toán bằng Thẻ (Visa/Mastercard)</Text>
            <Ionicons name={showCardForm ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Card Form */}
          {showCardForm && (
            <View style={[styles.cardForm, darkMode && { backgroundColor: "#1F2937" }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, darkMode && { color: "#9CA3AF" }]}>Tên chủ thẻ</Text>
                <TextInput
                  style={[styles.input, darkMode && { backgroundColor: "#111827", color: "#fff", borderColor: "#374151" }]}
                  placeholder="NGUYEN VAN A"
                  placeholderTextColor="#64748B"
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, darkMode && { color: "#9CA3AF" }]}>Số thẻ</Text>
                <TextInput
                  style={[styles.input, darkMode && { backgroundColor: "#111827", color: "#fff", borderColor: "#374151" }]}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  maxLength={16}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={[styles.inputLabel, darkMode && { color: "#9CA3AF" }]}>Hết hạn (MM/YY)</Text>
                  <TextInput
                    style={[styles.input, darkMode && { backgroundColor: "#111827", color: "#fff", borderColor: "#374151" }]}
                    placeholder="12/25"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={expiry}
                    onChangeText={setExpiry}
                    maxLength={5}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={[styles.inputLabel, darkMode && { color: "#9CA3AF" }]}>CVV</Text>
                  <TextInput
                    style={[styles.input, darkMode && { backgroundColor: "#111827", color: "#fff", borderColor: "#374151" }]}
                    placeholder="123"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    secureTextEntry
                    value={cvv}
                    onChangeText={setCvv}
                    maxLength={3}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.payNowBtn}
                onPress={handleCardPayment}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.payNowText}>Thanh toán ngay</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {processing && !showCardForm && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#22C55E" />
            <Text style={styles.overlayText}>Đang xử lý giao dịch...</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMethod: {
    borderColor: '#22C55E',
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

  // Card Form Styles
  cardForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    ...getShadow(0.05, 5, 2),
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  row: { flexDirection: 'row' },
  payNowBtn: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  payNowText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayText: { color: '#fff', marginTop: 15, fontSize: 16, fontWeight: '600' },
});

