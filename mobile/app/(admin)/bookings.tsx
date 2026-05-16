import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { bookingService } from "@/src/services/booking.service";
import { useAuthStore } from "@/src/store/auth.store";

type Status = "pending" | "approved" | "confirmed" | "cancelled" | "completed";

export default function AdminBookings() {
  const { darkMode } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const bookingDate = new Date(b.booking_date).toISOString().split('T')[0];
    const matchDate = !date || bookingDate === date;
    return matchStatus && matchDate;
  });

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await bookingService.updateBookingStatus(id, newStatus);
      fetchBookings();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Cập nhật trạng thái thất bại");
    }
  };

  const getColor = (s: string) => {
    switch (s) {
      case "pending":
        return "#f59e0b";
      case "approved":
      case "confirmed":
      case "completed":
        return "#16a34a";
      case "cancelled":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.row, darkMode && { backgroundColor: "#1F2937" }]}>
      <Text style={[styles.cell, darkMode && { color: "#fff" }]} numberOfLines={1}>{item.user_id?.full_name || "Unknown"}</Text>
      <Text style={[styles.cell, darkMode && { color: "#fff" }]} numberOfLines={1}>{item.field_id?.field_name || "N/A"}</Text>
      <Text style={[styles.cell, darkMode && { color: "#fff" }]}>{new Date(item.booking_date).toLocaleDateString()}</Text>
      <Text style={[styles.cell, darkMode && { color: "#fff" }]}>{item.booking_slot?.start}-{item.booking_slot?.end}</Text>

      {/* STATUS */}
      <View
        style={[
          styles.badge,
          { backgroundColor: getColor(item.status) },
        ]}
      >
        <Text style={styles.badgeText}>{item.status}</Text>
      </View>

      {/* ACTION */}
      <View style={styles.actions}>
        {item.status === "pending" && (
          <>
            <TouchableOpacity
              onPress={() => updateStatus(item._id, "confirmed")}
            >
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateStatus(item._id, "cancelled")}
            >
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading && bookings.length === 0) {
    return (
      <View style={[styles.centered, darkMode && { backgroundColor: "#111827" }]}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <Text style={[styles.title, darkMode && { color: "#fff" }]}>Booking Management</Text>

      {/* FILTER */}
      <View style={[styles.filter, darkMode && { backgroundColor: "#1F2937" }]}>
        <View style={[styles.inputBox, darkMode && { borderColor: "#374151" }]}>
          <Ionicons name="calendar-outline" size={16} color={darkMode ? "#9CA3AF" : "#111827"} />
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor={darkMode ? "#4B5563" : "#9CA3AF"}
            value={date}
            onChangeText={setDate}
            style={[{ flex: 1 }, darkMode && { color: "#fff" }]}
          />
        </View>

        <View style={styles.statusRow}>
          {["all", "pending", "confirmed", "cancelled", "completed"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatusFilter(s as any)}
              style={[
                styles.statusBtn,
                darkMode && { borderColor: "#374151" },
                statusFilter === s && styles.active,
              ]}
            >
              <Text
                style={
                  statusFilter === s
                    ? styles.activeText
                    : [styles.text, darkMode && { color: "#9CA3AF" }]
                }
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* HEADER TABLE */}
      <View style={[styles.header, darkMode && { backgroundColor: "#1F2937" }]}>
        <Text style={[styles.cell, darkMode && { color: "#9CA3AF" }]}>User</Text>
        <Text style={[styles.cell, darkMode && { color: "#9CA3AF" }]}>Field</Text>
        <Text style={[styles.cell, darkMode && { color: "#9CA3AF" }]}>Date</Text>
        <Text style={[styles.cell, darkMode && { color: "#9CA3AF" }]}>Time</Text>
        <Text style={[styles.cell, darkMode && { color: "#9CA3AF" }]}>Status</Text>
        <Text style={[styles.cell, darkMode && { color: "#9CA3AF" }]}>Action</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchBookings}
        ListEmptyComponent={<Text style={[{ textAlign: 'center', marginTop: 20 }, darkMode && { color: "#9CA3AF" }]}>No bookings found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },

  filter: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },

  statusRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  statusBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  active: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },

  text: { color: "#333" },
  activeText: { color: "#fff" },

  header: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    alignItems: "center",
  },

  cell: {
    flex: 1,
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },
});