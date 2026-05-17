import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { fieldService } from "../../src/services/field.service";
import { bookingService } from "../../src/services/booking.service";
import { getImageUrl } from "../../src/utils/helpers";
import { getShadow } from "../../src/utils/style";
import { useAuthStore } from "../../src/store/auth.store";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { darkMode } = useAuthStore();
  const [field, setField] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [busySlots, setBusySlots] = useState<any[]>([]);

  useEffect(() => {
    if (id) fetchFieldDetails();
  }, [id]);

  useEffect(() => {
    if (selectedDate && id) {
      fetchBusySlots();
    }
  }, [selectedDate, id]);

  const fetchFieldDetails = async () => {
    try {
      setLoading(true);
      const res = await fieldService.getFieldById(id);
      if (res && res.data) {
        setField(res.data);
      }
    } catch (error) {
      if (Platform.OS === 'web') window.alert("Không thể lấy thông tin sân");
      else Alert.alert("Lỗi", "Không thể lấy thông tin sân");
    } finally {
      setLoading(false);
    }
  };

  const fetchBusySlots = async () => {
    try {
      const res = await bookingService.getBusySlots(id, selectedDate);
      if (res.success) {
        setBusySlots(res.data);
      }
    } catch (error) {
      console.error("Error fetching busy slots:", error);
    }
  };

  const addHours = (time: string, hours: number) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const newH = h + hours;
    return `${newH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const isTimeBusy = (time: string) => {
    return busySlots.some(slot => {
      return time >= slot.start && time < slot.end;
    });
  };

  const isRangeBusy = (start: string, durationHours: number) => {
    const end = addHours(start, durationHours);
    return busySlots.some(slot => {
      return start < slot.end && slot.start < end;
    });
  };

  const calculateTotal = () => (field?.price_per_hour || 0) * duration;

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      const msg = "Vui lòng chọn ngày và giờ";
      return Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Thông báo", msg);
    }

    if (isRangeBusy(selectedTime, duration)) {
      const msg = "Khoảng thời gian bạn chọn có một phần đã bị người khác đặt. Vui lòng chọn giờ khác.";
      return Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Lỗi", msg);
    }

    try {
      setBookingLoading(true);

      const payload = {
        field_id: id,
        booking_date: selectedDate,
        booking_slot: {
          start: selectedTime,
          end: addHours(selectedTime, duration)
        },
        payment_method: 'cash'
      };

      await bookingService.createBooking(payload);

      const successMsg = "Đã đặt sân thành công!";
      if (Platform.OS === 'web') {
        window.alert(successMsg);
        router.replace("/(user)/");
      } else {
        Alert.alert("Thành công", successMsg, [
          { text: "OK", onPress: () => router.replace("/(user)/") }
        ]);
      }
    } catch (error: any) {
      console.error("[Booking] Error:", error);
      const errorMsg = error.message || "Đặt sân thất bại";
      if (Platform.OS === 'web') window.alert(errorMsg);
      else Alert.alert("Lỗi", errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <View style={[styles.centered, darkMode && { backgroundColor: "#111827" }]}><ActivityIndicator size="large" color="#22C55E" /></View>;
  if (!field) return <View style={[styles.centered, darkMode && { backgroundColor: "#111827" }]}><Text style={darkMode && { color: "#fff" }}>Không tìm thấy thông tin sân</Text></View>;

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={[styles.backButton, darkMode && { backgroundColor: "#1F2937" }]} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={darkMode ? "#fff" : "#111827"} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, darkMode && { color: "#fff" }]}>Đặt sân</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={[styles.title, darkMode && { color: "#fff" }]}>{field.field_name}</Text>
            <Text style={[styles.subtitle, darkMode && { color: "#9CA3AF" }]}>Vui lòng chọn ngày và giờ muốn đặt</Text>
          </View>
        </SafeAreaView>

        <View style={[styles.fieldCard, darkMode && { backgroundColor: "#1F2937" }]}>
          <Image source={{ uri: getImageUrl(field.images?.[0]) }} style={styles.fieldImage} />
          <View style={styles.fieldInfo}>
            <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>{field.field_name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FACC15" />
              <Text style={[styles.rating, darkMode && { color: "#fff" }]}>{field.users_rate || "5.0"}</Text>
              <Text style={[styles.review, darkMode && { color: "#9CA3AF" }]}>({field.reviewCount || 0} đánh giá)</Text>
            </View>
          </View>
        </View>

        <View style={[styles.calendarContainer, darkMode && { backgroundColor: "#1F2937" }]}>
          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Chọn ngày</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{ [selectedDate]: { selected: true, selectedColor: "#22C55E" } }}
            minDate={new Date().toISOString().split("T")[0]}
            theme={{
              todayTextColor: "#22C55E",
              arrowColor: "#22C55E",
              selectedDayBackgroundColor: "#22C55E",
              calendarBackground: darkMode ? "#1F2937" : "#fff",
              textSectionTitleColor: darkMode ? "#9CA3AF" : "#b6c1cd",
              dayTextColor: darkMode ? "#fff" : "#2d4150",
              monthTextColor: darkMode ? "#fff" : "#2d4150",
              textDisabledColor: darkMode ? "#374151" : "#d9e1e8",
            }}
          />
        </View>

        <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Chọn giờ bắt đầu</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const busy = isTimeBusy(slot);
              return (
                <TouchableOpacity
                  key={slot}
                  disabled={busy}
                  style={[
                    styles.timeButton,
                    darkMode && { borderColor: "#374151" },
                    selectedTime === slot && styles.timeButtonActive,
                    busy && { backgroundColor: darkMode ? "#374151" : "#E5E7EB", borderColor: "transparent", opacity: 0.5 }
                  ]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text style={[
                    styles.timeText,
                    darkMode && { color: "#9CA3AF" },
                    selectedTime === slot && styles.timeTextActive,
                    busy && { color: "#9CA3AF", textDecorationLine: 'line-through' }
                  ]}>{slot}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Thời lượng (Giờ)</Text>
          <View style={styles.durationRow}>
            <TouchableOpacity
              style={[styles.durationBtn, darkMode && { backgroundColor: "#064E3B" }]}
              onPress={() => setDuration(Math.max(1, duration - 1))}
            >
              <Ionicons name="remove" size={24} color="#22C55E" />
            </TouchableOpacity>

            <Text style={[styles.durationText, darkMode && { color: "#fff" }]}>{duration} giờ</Text>

            <TouchableOpacity
              style={[styles.durationBtn, darkMode && { backgroundColor: "#064E3B" }]}
              onPress={() => setDuration(Math.min(5, duration + 1))}
            >
              <Ionicons name="add" size={24} color="#22C55E" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Tóm tắt thanh toán</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summaryLabel, darkMode && { color: "#fff" }]}>{field.field_name}</Text>
              <Text style={[styles.summarySub, darkMode && { color: "#9CA3AF" }]}>{duration} giờ x {field.price_per_hour?.toLocaleString('vi-VN')}đ</Text>
            </View>
            <Text style={styles.totalPrice}>{calculateTotal()?.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, darkMode && { backgroundColor: "#1F2937", borderTopColor: "#374151" }]}>
        <TouchableOpacity
          disabled={!selectedTime || bookingLoading}
          style={[styles.confirmButton, (!selectedTime || bookingLoading) && { backgroundColor: "#9CA3AF" }]}
          onPress={handleConfirmBooking}
        >
          {bookingLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Xác nhận đặt - {calculateTotal()?.toLocaleString('vi-VN')}đ</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backButton: { padding: 8, backgroundColor: '#fff', borderRadius: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 6 },
  subtitle: { color: "#6B7280", fontSize: 15, marginBottom: 20 },
  fieldCard: { flexDirection: "row", backgroundColor: "#FFFFFF", marginHorizontal: 20, borderRadius: 20, overflow: "hidden", marginBottom: 20, ...getShadow(0.05, 10, 3) },
  fieldImage: { width: 120, height: 110 },
  fieldInfo: { flex: 1, padding: 14, justifyContent: "center" },
  fieldName: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { fontWeight: "700" },
  review: { color: "#6B7280", fontSize: 13 },
  calendarContainer: { backgroundColor: "#fff", borderRadius: 20, padding: 15, marginHorizontal: 20, marginBottom: 20, ...getShadow(0.05, 10, 3) },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15, color: "#111827" },
  card: { backgroundColor: "#FFFFFF", marginHorizontal: 20, borderRadius: 20, padding: 18, marginBottom: 20, ...getShadow(0.05, 10, 3) },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeButton: { width: "30%", paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center" },
  timeButtonActive: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  timeText: { fontWeight: "600" },
  timeTextActive: { color: "#FFFFFF" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 16, fontWeight: "600", color: "#111827" },
  summarySub: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  totalPrice: { fontSize: 24, fontWeight: "700", color: "#22C55E" },
  durationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, paddingVertical: 10 },
  durationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  durationText: { fontSize: 18, fontWeight: '700', color: '#111827', width: 80, textAlign: 'center' },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  confirmButton: { backgroundColor: "#22C55E", height: 58, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  confirmText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
