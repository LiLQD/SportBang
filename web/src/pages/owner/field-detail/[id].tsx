import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { fieldService } from "@/src/services/field.service";
import { getShadow } from "@/src/utils/style";
import { getImageUrl } from "@/src/utils/helpers";

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { darkMode } = useAuthStore();
  const [field, setField] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFieldDetail();
  }, [id]);

  const fetchFieldDetail = async () => {
    try {
      setLoading(true);
      const res = await fieldService.getFieldById(id as string);
      if (res.success) {
        setField(res.data);
      }
    } catch (error: any) {
      console.error("Fetch field detail error:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin sân bóng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa sân bóng này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fieldService.deleteField(id as string);
              if (res.success) {
                Alert.alert("Thành công", "Đã xóa sân bóng");
                router.back();
              }
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Không thể xóa sân bóng");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, darkMode && { backgroundColor: "#111827" }]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!field) {
    return (
      <View style={[styles.container, styles.centered, darkMode && { backgroundColor: "#111827" }]}>
        <Text style={[styles.errorText, darkMode && { color: "#94A3B8" }]}>Không tìm thấy sân bóng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <Image
        source={{ uri: getImageUrl(field.images?.[0]) }}
        style={styles.headerImage}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>{field.field_name}</Text>
            <Text style={styles.fieldType}>{field.field_type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: field.status === 'active' ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: field.status === 'active' ? '#16A34A' : '#EF4444' }]}>
              {field.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#64748B" />
            <Text style={[styles.infoText, darkMode && { color: "#CBD5E1" }]}>{field.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#22C55E" />
            <Text style={styles.priceText}>{field.price_per_hour?.toLocaleString()} VNĐ / giờ</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Mô tả</Text>
        <Text style={[styles.description, darkMode && { color: "#94A3B8" }]}>
          {field.description || "Chưa có mô tả cho sân bóng này."}
        </Text>

        <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Tiện ích</Text>
        <View style={styles.amenityList}>
          {field.amenities && field.amenities.length > 0 ? (
            field.amenities.map((item: string, index: number) => (
              <View key={index} style={[styles.amenityTag, darkMode && { backgroundColor: "#374151" }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#22C55E" />
                <Text style={[styles.amenityText, darkMode && { color: "#CBD5E1" }]}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có tiện ích</Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Khung giờ hoạt động</Text>
        <View style={styles.timeSlots}>
          {field.available_time?.map((slot: any, index: number) => (
            <View key={index} style={[styles.timeTag, darkMode && { backgroundColor: "#374151" }]}>
              <Text style={[styles.timeText, darkMode && { color: "#fff" }]}>{slot.start} - {slot.end}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/owner/edit-field/${id}` as any)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editBtnText}>Chỉnh sửa sân</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteBtnText}>Xóa sân</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  centered: { justifyContent: "center", alignItems: "center" },
  headerImage: { width: "100%", height: 200, backgroundColor: "#E2E8F0" },
  content: { padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, backgroundColor: "#F8FAFC" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  fieldName: { fontSize: 22, fontWeight: "bold", color: "#1E293B" },
  fieldType: { fontSize: 14, color: "#64748B", marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "bold" },
  infoSection: { backgroundColor: "#fff", padding: 15, borderRadius: 16, marginBottom: 20, gap: 10, ...getShadow(0.05, 10, 2) },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { fontSize: 14, color: "#475569", flex: 1 },
  priceText: { fontSize: 16, fontWeight: "bold", color: "#22C55E" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginTop: 20, marginBottom: 12 },
  description: { fontSize: 14, color: "#64748B", lineHeight: 22 },
  amenityList: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amenityTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, ...getShadow(0.02, 5, 2) },
  amenityText: { fontSize: 13, color: "#475569" },
  timeSlots: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeTag: { backgroundColor: "#E2E8F0", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  timeText: { fontSize: 14, fontWeight: "500", color: "#475569" },
  actionButtons: { marginTop: 40, gap: 12 },
  editBtn: { backgroundColor: "#22C55E", height: 55, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, ...getShadow(0.1, 10, 5) },
  editBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  deleteBtn: { height: 55, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: "#FEE2E2" },
  deleteBtnText: { color: "#EF4444", fontSize: 16, fontWeight: "600" },
  errorText: { fontSize: 16, color: "#64748B" },
  emptyText: { fontSize: 14, color: "#94A3B8", fontStyle: "italic" },
});
