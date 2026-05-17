import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { fieldService } from "@/src/services/field.service";
import { getShadow } from "@/src/utils/style";

const SPORT_TYPES = ["Bóng đá", "Cầu lông", "Tennis", "Bóng rổ", "Bóng chuyền", "Khác"];

export default function EditFieldScreen() {
  const { id } = useLocalSearchParams();
  const { darkMode } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    field_name: "",
    sport_type: "Bóng đá",
    field_type: "",
    address: "",
    price_per_hour: "",
    description: "",
    image_url: "",
    status: "active"
  });

  useEffect(() => {
    fetchFieldDetail();
  }, [id]);

  const fetchFieldDetail = async () => {
    try {
      setFetching(true);
      const res = await fieldService.getFieldById(id as string);
      if (res.success) {
        const field = res.data;
        setForm({
          field_name: field.field_name,
          sport_type: field.sport_type || "Bóng đá",
          field_type: field.field_type || "",
          address: field.address,
          price_per_hour: field.price_per_hour.toString(),
          description: field.description || "",
          image_url: field.images && field.images.length > 0 ? field.images[0] : "",
          status: field.status || "active"
        });
      }
    } catch (error: any) {
      console.error("Fetch field detail error:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin sân");
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.field_name || !form.address || !form.price_per_hour || !form.field_type) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        price_per_hour: Number(form.price_per_hour),
        images: form.image_url ? [form.image_url] : []
      };

      const res = await fieldService.updateField(id as string, payload);
      if (res) {
        Alert.alert("Thành công", "Đã cập nhật thông tin sân bóng");
        router.back();
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật sân");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa sân này? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa sân",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fieldService.deleteField(id as string);
              if (res.success) {
                Alert.alert("Thành công", "Đã xóa sân bóng");
                router.replace("/owner/(tabs)/fields");
              }
            } catch (error: any) {
              Alert.alert("Lỗi", "Không thể xóa sân");
            }
          }
        }
      ]
    );
  };

  if (fetching) {
    return (
      <View style={[styles.loadingContainer, darkMode && { backgroundColor: "#111827" }]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
             <View style={styles.avatarCircle}>
                <Ionicons name="football" size={40} color="#22C55E" />
             </View>
             <TouchableOpacity style={styles.changeImageBtn}>
                <Text style={styles.changeImageText}>Ảnh sân</Text>
             </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, darkMode && styles.cardDark]}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>

          <View style={styles.profileItem}>
            <Text style={styles.itemLabel}>Tên sân *</Text>
            <TextInput
              style={[styles.itemInput, darkMode && { color: "#fff" }]}
              value={form.field_name}
              onChangeText={(t) => setForm({...form, field_name: t})}
            />
          </View>

          <View style={styles.profileItem}>
            <Text style={styles.itemLabel}>Môn thể thao</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportScroll}>
              {SPORT_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setForm({...form, sport_type: type})}
                  style={[styles.miniBtn, form.sport_type === type && styles.miniBtnActive]}
                >
                  <Text style={[styles.miniBtnText, form.sport_type === type && styles.miniBtnTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.profileItem}>
            <Text style={styles.itemLabel}>Loại sân *</Text>
            <TextInput
              style={[styles.itemInput, darkMode && { color: "#fff" }]}
              placeholder="Sân 5, Sân đơn..."
              value={form.field_type}
              onChangeText={(t) => setForm({...form, field_type: t})}
            />
          </View>

          <View style={styles.profileItem}>
            <Text style={styles.itemLabel}>Địa chỉ *</Text>
            <TextInput
              style={[styles.itemInput, darkMode && { color: "#fff" }]}
              value={form.address}
              onChangeText={(t) => setForm({...form, address: t})}
            />
          </View>
        </View>

        <View style={[styles.card, darkMode && styles.cardDark, { marginTop: 15 }]}>
          <Text style={styles.sectionTitle}>Chi tiết & Giá</Text>

          <View style={styles.profileItem}>
            <Text style={styles.itemLabel}>Link hình ảnh</Text>
            <TextInput
              style={[styles.itemInput, darkMode && { color: "#fff" }]}
              value={form.image_url}
              onChangeText={(t) => setForm({...form, image_url: t})}
            />
          </View>

          <View style={styles.profileItem}>
            <Text style={styles.itemLabel}>Giá thuê/giờ (VNĐ)</Text>
            <TextInput
              style={[styles.itemInput, darkMode && { color: "#fff" }]}
              keyboardType="numeric"
              value={form.price_per_hour}
              onChangeText={(t) => setForm({...form, price_per_hour: t})}
            />
          </View>

          <View style={[styles.profileItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.itemLabel}>Mô tả</Text>
            <TextInput
              style={[styles.itemInput, { height: 60 }, darkMode && { color: "#fff" }]}
              multiline
              value={form.description}
              onChangeText={(t) => setForm({...form, description: t})}
            />
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu thông tin</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteLink} onPress={handleDelete}>
            <Text style={styles.deleteLinkText}>Xóa sân này</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", paddingVertical: 30, backgroundColor: "#fff" },
  avatarContainer: { alignItems: "center" },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#DCFCE7", justifyContent: "center", alignItems: "center" },
  changeImageBtn: { marginTop: 10 },
  changeImageText: { color: "#22C55E", fontWeight: "600", fontSize: 14 },
  card: { backgroundColor: "#fff", paddingHorizontal: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  cardDark: { backgroundColor: "#1F2937", borderColor: "#374151" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#94A3B8", marginTop: 16, marginBottom: 8, textTransform: "uppercase" },
  profileItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", minHeight: 55 },
  itemLabel: { width: 120, fontSize: 15, color: "#475569", fontWeight: "500" },
  itemInput: { flex: 1, fontSize: 15, color: "#1E293B", paddingVertical: 0 },
  sportScroll: { flex: 1 },
  miniBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, backgroundColor: "#F1F5F9", marginRight: 8 },
  miniBtnActive: { backgroundColor: "#22C55E" },
  miniBtnText: { fontSize: 12, color: "#64748B" },
  miniBtnTextActive: { color: "#fff", fontWeight: "600" },
  buttonGroup: { padding: 20, marginTop: 10 },
  saveBtn: { backgroundColor: "#22C55E", height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", ...getShadow(0.1, 5, 2) },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  deleteLink: { marginTop: 20, alignItems: "center" },
  deleteLinkText: { color: "#EF4444", fontSize: 14, fontWeight: "600" }
});
