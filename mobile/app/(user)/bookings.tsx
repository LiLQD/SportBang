import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";

import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getImageUrl } from "@/src/utils/helpers";
import { reviewService } from "@/src/services/review.service";
import { bookingService } from "@/src/services/booking.service";
import { getShadow } from "@/src/utils/style";
import { useAuthStore } from "@/src/store/auth.store";
import { Toast, ToastType } from "@/src/components/Toast";
import { ConfirmationModal } from "@/src/components/ConfirmationModal";

export default function BookingScreen() {
  const { darkMode } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // UI States
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getMyBookings();
      if (res && res.data) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;

    try {
      setLoading(true);
      await bookingService.cancelBooking(cancelBookingId);
      showToast("Đã hủy đơn đặt sân thành công");
      await fetchBookings();
    } catch (error: any) {
      console.error("[BookingScreen] Lỗi khi hủy:", error);
      showToast(error.message || "Không thể hủy đơn đặt sân lúc này", "error");
    } finally {
      setLoading(false);
      setCancelBookingId(null);
    }
  };

  const submitReview = async () => {
    if (!selectedBooking) return;
    try {
      setIsSubmitting(true);
      await reviewService.createReview({
        field_id: selectedBooking.field_id._id,
        booking_id: selectedBooking._id,
        rating,
        comment,
      });
      showToast("Gửi đánh giá thành công");
      setIsReviewModalVisible(false);
      fetchBookings();
    } catch (error: any) {
      showToast(error.message || "Không thể gửi đánh giá", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBooking = ({ item }: { item: any }) => (
    <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
      <Image source={{ uri: getImageUrl(item.field_id?.images?.[0]) }} style={styles.image} />
      <View style={styles.contentContainer}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>{item.field_id?.field_name || "Sân bóng"}</Text>
          <Text style={[styles.infoText, darkMode && { color: "#9CA3AF" }]}>{new Date(item.booking_date).toLocaleDateString()}</Text>
          <Text style={[styles.infoText, darkMode && { color: "#9CA3AF" }]}>{item.booking_slot.start} - {item.booking_slot.end}</Text>
          <View style={[styles.badge, item.status === 'cancelled' && { backgroundColor: '#FEE2E2' }, darkMode && item.status !== 'cancelled' && { backgroundColor: '#1E3A8A' }]}>
            <Text style={[styles.badgeText, item.status === 'cancelled' && { color: '#EF4444' }, darkMode && item.status !== 'cancelled' && { color: '#60A5FA' }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <View style={{ gap: 8, justifyContent: 'center' }}>
          {(item.status === 'pending' || item.status === 'confirmed') && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCancelBookingId(item._id)}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Text style={styles.cancelText}>Hủy sân</Text>
            </TouchableOpacity>
          )}
          {item.status === 'completed' && (
            <TouchableOpacity style={styles.reviewButton} onPress={() => { setSelectedBooking(item); setIsReviewModalVisible(true); }}>
              <Text style={styles.reviewButtonText}>Đánh giá</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) return <View style={[styles.centered, darkMode && { backgroundColor: "#111827" }]}><ActivityIndicator size="large" color="#22C55E" /></View>;

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <Text style={[styles.title, darkMode && { color: "#fff" }]}>Lịch sử đặt sân</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderBooking}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có lịch đặt nào</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#22C55E"]}
            tintColor={darkMode ? "#fff" : "#22C55E"}
          />
        }
      />
      <Modal visible={isReviewModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && { backgroundColor: "#1F2937" }]}>
            <Text style={[styles.modalTitle, darkMode && { color: "#fff" }]}>Đánh giá sân</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color={star <= rating ? "#F59E0B" : "#9CA3AF"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.reviewInput, darkMode && { backgroundColor: "#374151", borderColor: "#4B5563", color: "#fff" }]}
              multiline
              value={comment}
              onChangeText={setComment}
              placeholder="Cảm nhận của bạn..."
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={{color:'#fff', fontWeight: 'bold'}}>Gửi</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsReviewModalVisible(false)}><Text style={{marginTop:10, color:'#9CA3AF'}}>Đóng</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        visible={!!cancelBookingId}
        title="Hủy đặt sân"
        message="Bạn có chắc chắn muốn hủy đơn đặt sân này không?"
        onConfirm={handleCancelBooking}
        onCancel={() => setCancelBookingId(null)}
        type="danger"
        confirmText="Hủy sân"
        darkMode={darkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", marginBottom: 18, ...getShadow(0.05, 10, 3) },
  image: { width: "100%", height: 150 },
  contentContainer: { flexDirection: "row", padding: 16 },
  fieldName: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  infoText: { color: "#6B7280", marginBottom: 4 },
  badge: { alignSelf: 'flex-start', padding: 6, borderRadius: 8, backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  cancelButton: { borderWidth: 1, borderColor: '#EF4444', padding: 8, borderRadius: 8 },
  cancelText: { color: '#EF4444' },
  reviewButton: { backgroundColor: '#22C55E', padding: 8, borderRadius: 8 },
  reviewButtonText: { color: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#9CA3AF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15 },
  starsContainer: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  reviewInput: { width: '100%', height: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 10, marginBottom: 15 },
  submitBtn: { backgroundColor: '#22C55E', padding: 12, borderRadius: 12, width: '100%', alignItems: 'center' }
});
