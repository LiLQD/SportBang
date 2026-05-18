import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
  RefreshControl,
} from "react-native";

import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getImageUrl } from "@/src/utils/helpers";
import { reviewService } from "@/src/services/review.service";
import { bookingService } from "@/src/services/booking.service";
import { getShadow } from "@/src/utils/style";
import { useAuthStore } from "@/src/store/auth.store";

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

  const handleCancelBooking = (id: string) => {
    // 1. Log để kiểm tra trong console debug
    console.log("[BookingScreen] Clicked Cancel for ID:", id);

    // 2. Alert đơn giản để xác nhận nút có hoạt động hay không
    if (!id) {
      alert("Lỗi: Không tìm thấy ID đơn đặt sân.");
      return;
    }

    const msg = "Bạn có chắc chắn muốn hủy đơn đặt sân này không?";

    const executeCancel = async () => {
      try {
        setLoading(true);
        console.log("[BookingScreen] Gọi API hủy sân...");
        const response = await bookingService.cancelBooking(id);
        console.log("[BookingScreen] Kết quả API:", response);

        const successMsg = "Đã hủy đơn đặt sân thành công.";
        if (Platform.OS === 'web') {
          window.alert(successMsg);
        } else {
          Alert.alert("Thành công", successMsg);
        }

        await fetchBookings();
      } catch (error: any) {
        console.error("[BookingScreen] Lỗi khi hủy:", error);
        const errorMsg = error.message || "Không thể hủy đơn đặt sân lúc này.";
        if (Platform.OS === 'web') {
          window.alert("Lỗi: " + errorMsg);
        } else {
          Alert.alert("Lỗi", errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    // 3. Xử lý xác nhận linh hoạt cho Web và Mobile
    if (Platform.OS === 'web') {
      const confirmCancel = window.confirm(msg);
      if (confirmCancel) {
        executeCancel();
      }
    } else {
      Alert.alert(
        "Xác nhận hủy",
        msg,
        [
          { text: "Quay lại", style: "cancel" },
          {
            text: "Hủy sân",
            style: "destructive",
            onPress: () => {
              console.log("[BookingScreen] User confirmed cancellation");
              executeCancel();
            }
          }
        ],
        { cancelable: true }
      );
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
      setIsReviewModalVisible(false);
      fetchBookings();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
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
              onPress={() => handleCancelBooking(item._id)}
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
