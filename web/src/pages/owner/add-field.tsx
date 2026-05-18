import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { fieldService } from "@/src/services/field.service";
import { getShadow } from "@/src/utils/style";

const SPORT_TYPES = ["Bóng đá", "Cầu lông", "Tennis", "Bóng rổ", "Bóng chuyền", "Khác"];

export default function AddFieldScreen() {
  const { darkMode } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    field_name: "",
    sport_type: "Bóng đá",
    field_type: "",
    address: "",
    price_per_hour: "",
    description: "",
    image_url: "",
    available_time: [{ start: "06:00", end: "22:00" }],
    amenities: [] as string[],
  });

  const handleAddField = async () => {
    if (!form.field_name || !form.address || !form.price_per_hour || !form.field_type) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        field_name: form.field_name,
        sport_type: form.sport_type,
        field_type: form.field_type,
        address: form.address,
        price_per_hour: Number(form.price_per_hour),
        description: form.description,
        images: form.image_url ? [form.image_url] : [],
        available_time: form.available_time,
        amenities: form.amenities
      };

      const res = await fieldService.createField(payload);

      if (res) {
        Alert.alert("Thành công", "Đã tạo sân thể thao mới!");
        router.back();
      }
    } catch (error: any) {
      console.error("Add field error:", error);
      Alert.alert("Lỗi", error.message || "Không thể tạo sân. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={styles.form}>
        <Text style={styles.sectionLabel}>Thông tin sân</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, darkMode && { color: "#fff" }]}>Tên sân *</Text>
          <TextInput
            style={[styles.input, darkMode && styles.inputDark]}
            placeholder="Ví dụ: SportBang Stadium"
            placeholderTextColor="#94A3B8"
            value={form.field_name}
            onChangeText={(text) => setForm({ ...form, field_name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, darkMode && { color: "#fff" }]}>Môn thể thao *</Text>
          <View style={styles.sportGrid}>
            {SPORT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.sportBtn,
                  form.sport_type === type && styles.sportBtnActive,
                  darkMode && styles.sportBtnDark
                ]}
                onPress={() => setForm({ ...form, sport_type: type })}
              >
                <Text style={[
                  styles.sportBtnText,
                  form.sport_type === type && styles.sportBtnTextActive
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, darkMode && { color: "#fff" }]}>Loại sân cụ thể *</Text>
          <TextInput
            style={[styles.input, darkMode && styles.inputDark]}
            placeholder="Ví dụ: Sân 5 người, Sân thảm, Sân cỏ..."
            placeholderTextColor="#94A3B8"
            value={form.field_type}
            onChangeText={(text) => setForm({ ...form, field_type: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, darkMode && { color: "#fff" }]}>Link ảnh sân</Text>
          <TextInput
            style={[styles.input, darkMode && styles.inputDark]}
            placeholder="Dán link ảnh (https://...)"
            placeholderTextColor="#94A3B8"
            value={form.image_url}
            onChangeText={(text) => setForm({ ...form, image_url: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, darkMode && { color: "#fff" }]}>Địa chỉ *</Text>
          <TextInput
            style={[styles.input, darkMode && styles.inputDark]}
            placeholder="Nhập địa chỉ chi tiết"
            placeholderTextColor="#94A3B8"
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, darkMode && { color: "#fff" }]}>Giá thuê/giờ (VNĐ) *</Text>
          <TextInput
            style={[styles.input, darkMode && styles.inputDark]}
            placeholder="Ví dụ: 300000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={form.price_per_hour}
            onChangeText={(text) => setForm({ ...form, price_per_hour: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, darkMode && { color: "#fff" }]}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea, darkMode && styles.inputDark]}
            placeholder="Giới thiệu về sân..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleAddField}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Tạo sân ngay</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  form: { padding: 20 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 15 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: "600", color: "#334155", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1E293B",
  },
  inputDark: { backgroundColor: "#1F2937", borderColor: "#374151", color: "#fff" },
  textArea: { height: 100, textAlignVertical: "top" },
  sportGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sportBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0" },
  sportBtnDark: { backgroundColor: "#374151", borderColor: "#4B5563" },
  sportBtnActive: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  sportBtnText: { color: "#64748B", fontSize: 13, fontWeight: "500" },
  sportBtnTextActive: { color: "#fff", fontWeight: "bold" },
  submitBtn: {
    backgroundColor: "#22C55E",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    ...getShadow(0.1, 10, 5),
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
