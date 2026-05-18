import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { adminService } from "@/src/services/admin.service";
import { useAuthStore } from "@/src/store/auth.store";
import { getShadow } from "@/src/utils/style";

export default function AdminFields() {
  const { darkMode } = useAuthStore();
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFields = async () => {
    try {
      const res = await adminService.getAllFields();
      if (res.success) {
        setFields(res.data);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFields();
  }, []);

  const handleUpdateStatus = (field: any) => {
    const statuses = [
        { label: 'Hoạt động', value: 'active', color: '#16a34a' },
        { label: 'Bảo trì', value: 'maintenance', color: '#F59E0B' },
        { label: 'Ngừng hoạt động', value: 'inactive', color: '#EF4444' }
    ];

    Alert.alert(
      "Cập nhật trạng thái",
      `Chọn trạng thái mới cho sân ${field.field_name}:`,
      statuses.map(s => ({
        text: s.label,
        onPress: async () => {
            try {
                await adminService.updateFieldStatus(field._id, s.value);
                fetchFields();
            } catch (error: any) {
                Alert.alert("Lỗi", error.message || "Cập nhật thất bại");
            }
        }
      })).concat([{ text: "Hủy", style: "cancel" }] as any)
    );
  };

  const filteredFields = fields.filter(f =>
    f.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.owner_id?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#DCFCE7', text: '#166534', label: 'Hoạt động' };
      case 'maintenance': return { bg: '#FEF3C7', text: '#92400E', label: 'Bảo trì' };
      default: return { bg: '#FEE2E2', text: '#991B1B', label: 'Ngừng' };
    }
  };

  const renderFieldItem = ({ item }: { item: any }) => {
    const status = getStatusStyle(item.status);
    return (
      <View style={[styles.fieldCard, darkMode && { backgroundColor: "#1F2937" }]}>
        <View style={styles.fieldHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>{item.field_name}</Text>
            <Text style={styles.fieldSub} numberOfLines={1}>
                <Ionicons name="location-outline" size={12} /> {item.address}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.ownerInfo}>
            <Ionicons name="person-circle-outline" size={16} color="#64748B" />
            <Text style={styles.ownerText}>Chủ sân: <Text style={{fontWeight: '600'}}>{item.owner_id?.full_name || 'N/A'}</Text></Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
            <Text style={styles.priceText}>{item.price_per_hour.toLocaleString()}đ/giờ</Text>
            <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleUpdateStatus(item)}
            >
                <Ionicons name="settings-outline" size={16} color="#16a34a" />
                <Text style={styles.actionBtnText}>Trạng thái</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, darkMode && { backgroundColor: "#1F2937", borderColor: "#374151" }]}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            placeholder="Tìm sân, địa chỉ hoặc chủ sân..."
            placeholderTextColor="#94A3B8"
            style={[styles.searchInput, darkMode && { color: "#fff" }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredFields}
        keyExtractor={(item) => item._id}
        renderItem={renderFieldItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
        }
        ListEmptyComponent={
          loading ? null : <Text style={styles.emptyText}>Không tìm thấy sân bóng nào</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  searchContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...getShadow(0.05, 10, 3),
  },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  fieldName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  fieldSub: { fontSize: 13, color: '#64748B', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  ownerInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
  ownerText: { fontSize: 13, color: '#64748B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#16a34a' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#16a34a10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBtnText: { color: '#16a34a', fontWeight: '600', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94A3B8' }
});
