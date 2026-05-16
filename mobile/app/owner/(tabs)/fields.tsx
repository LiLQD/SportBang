import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { ownerService } from "@/src/services/owner.service";
import { getShadow } from "@/src/utils/style";

export default function FieldsList() {
  const { darkMode } = useAuthStore();
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const res = await ownerService.getFields();
      if (res.success) {
        setFields(res.data);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFields();
    }, [])
  );

  const renderFieldItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.fieldCard, darkMode && { backgroundColor: "#1F2937" }]}
      onPress={() => router.push(`/(owner)/field-detail/${item.id}` as any)}
    >
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/150" }}
        style={styles.fieldImage}
      />
      <View style={styles.fieldInfo}>
        <View style={styles.fieldHeader}>
          <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>{item.field_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: item.is_active ? '#16A34A' : '#EF4444' }]}>
              {item.is_active ? 'Hoạt động' : 'Bảo trì'}
            </Text>
          </View>
        </View>
        <Text style={styles.fieldType}>{item.field_type}</Text>
        <View style={styles.fieldFooter}>
          <Text style={styles.fieldPrice}>{item.price_per_hour?.toLocaleString()}đ/giờ</Text>
          <TouchableOpacity style={styles.editBtn}>
             <Ionicons name="pencil" size={18} color="#22C55E" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <Text style={styles.headerTitle}>Sân bóng của tôi</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={fields}
          renderItem={renderFieldItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="football-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyText}>Bạn chưa có sân bóng nào</Text>
              <TouchableOpacity style={styles.createBtn}>
                <Text style={styles.createBtnText}>Thêm sân ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#22C55E",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 16,
    overflow: 'hidden',
    ...getShadow(0.05, 10, 3),
  },
  fieldImage: { width: 100, height: 100, backgroundColor: '#F1F5F9' },
  fieldInfo: { flex: 1, padding: 12 },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  fieldType: { fontSize: 13, color: '#64748B', marginTop: 2 },
  fieldFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  fieldPrice: { fontSize: 15, fontWeight: 'bold', color: '#22C55E' },
  editBtn: {
    padding: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
  },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#64748B', marginTop: 20, marginBottom: 20 },
  createBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: { color: '#fff', fontWeight: 'bold' }
});
