import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { paymentService } from "@/src/services/payment.service";
import { getShadow } from "@/src/utils/style";
import { Toast, ToastType } from "@/src/components/Toast";

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { darkMode } = useAuthStore();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  // Card states
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    fetchPaymentDetail();
  }, [id]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const fetchPaymentDetail = async () => {
    try {
      const res = await paymentService.getPaymentById(id as string);
      if (res && res.success) {
        setPayment(res.data);
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
      showToast("Không thể tải thông tin thanh toán", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    try {
      setProcessing(true);
      await paymentService.updatePaymentStatus(id as string, 'pending');
      showToast("Đã ghi nhận yêu cầu thanh toán tại sân!");
      setTimeout(() => router.replace("/(user)/payments"), 2000);
    } catch (error: any) {
      showToast(error.message || "Không thể cập nhật phương thức thanh toán.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const validateCard = () => {
    let errors: any = {};
    if (!cardHolder || cardHolder.length < 3) errors.cardHolder = "Tên không hợp lệ";
    if (cardNumber.length < 16) errors.cardNumber = "Số thẻ phải đủ 16 chữ số";
    if (!expiry.includes('/') || expiry.length < 5) errors.expiry = "Định dạng MM/YY";
    if (cvv.length < 3) errors.cvv = "Mã CVV không hợp lệ";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardPayment = async () => {
    if (!validateCard()) return;

    try {
      setProcessing(true);
      const res = await paymentService.updatePaymentStatus(id as string, 'paid');

      if (res && res.success) {
        showToast("Thanh toán thành công!");
        setTimeout(() => router.replace("/(user)/payments"), 2000);
      } else {
        throw new Error(res?.message || "Thanh toán thất bại");
      }
    } catch (error: any) {
      showToast(error.message || "Thanh toán thất bại. Vui lòng thử lại.", "error");
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
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onHide={() => setToast(null)}
          />
        )}
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
                  style={[
                    styles.input,
                    darkMode && { backgroundColor: "#111827", color: "#fff", borderColor: "#374151" },
                    formErrors.cardHolder && { borderColor: '#EF4444' }
                  ]}
                  placeholder="NGUYEN VAN A"
                  placeholderTextColor="#64748B"
                  value={cardHolder}
                  onChangeText={(v) => {
                    setCardHolder(v);
                    if (formErrors.cardHolder) setFormErrors({...formErrors, cardHolder: null});
                  }}
                  autoCapitalize="characters"
                />
                {formErrors.cardHolder && <Text style={styles.errorText}>{formErrors.cardHolder}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, darkMode && { color: "#9CA3AF" }]}>Số thẻ</Text>
                <TextInput
                  style={[
                    styles.input,
                    darkMode && { backgroundColor: "#111827", color: "#fff", borderColor: "#374151" },
                    formErrors.cardNumber && { borderColor: '#EF4444' }
                  ]}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={(v) => {
                    setCardNumber(v);
                    if (formErrors.cardNumber) setFormErrors({...formErrors, cardNumber: null});
                  }}
                  maxLength={16}
                />
                {formErrors.cardNumber && <Text style={styles.errorText}>{formErrors.cardNumber}</Text>}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={[styles.inputLabel, darkMode && { color: "#9CA3AF" }]}>Hết hạn (MM/YY)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      darkMode && { backgroundColor: "#111827", color: "#fff", borderColor: "#374151" },
                      formErrors.expiry && { borderColor: '#EF4444' }
                    ]}
                    placeholder="12/25"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={expiry}
                    onChangeText={(v) => {
                      setExpiry(v);
                      if (formErrors.expiry) setFormErrors({...formErrors, expiry: null});
                    }}
                    maxLength={5}
                  />
                  {formErrors.expiry && <Text style={styles.errorText}>{formErrors.expiry}</Text>}
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={[styles.inputLabel, darkMode && { color: "#9CA3AF" }]}>CVV</Text>
                  <TextInput
                    style={[
                      styles.input,
                      darkMode && { backgroundColor: "#111827", color: "#fff", borderColor: "#374151" },
                      formErrors.cvv && { borderColor: '#EF4444' }
                    ]}
                    placeholder="123"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    secureTextEntry
                    value={cvv}
                    onChangeText={(v) => {
                      setCvv(v);
                      if (formErrors.cvv) setFormErrors({...formErrors, cvv: null});
                    }}
                    maxLength={3}
                  />
                  {formErrors.cvv && <Text style={styles.errorText}>{formErrors.cvv}</Text>}
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
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

