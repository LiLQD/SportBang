import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { getImageUrl } from "@/src/utils/helpers";
import { getShadow } from "@/src/utils/style";

export default function FieldsList() {
  const { darkMode } = useAuthStore();
  const router = useRouter();
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFields = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const res = await ownerService.getFields();
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchFields(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchFields();
    }, [])
  );

  const renderFieldItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.fieldCard, darkMode && { backgroundColor: "#1F2937" }]}
      onPress={() => {
        const id = item._id || item.id;
        router.push(`/owner/field-detail/${id}`);
      }}
    >
      <Image
        source={{
          uri: getImageUrl(item.images?.[0])
        }}
        style={styles.fieldImage}
      />
      <View style={styles.fieldInfo}>
        <View style={styles.fieldHeader}>
          <Text style={[styles.fieldName, darkMode && { color: "#fff" }]} numberOfLines={1}>
            {item.field_name}
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/owner/edit-field/${item._id || item.id}` as any)}
            style={styles.editBtn}
          >
             <Ionicons name="ellipsis-horizontal-circle" size={24} color="#22C55E" />
          </TouchableOpacity>
        </View>

        <View style={styles.sportBadge}>
          <Text style={styles.sportText}>{item.sport_type || "Thể thao"}</Text>
        </View>

        <Text style={styles.fieldType} numberOfLines={1}>{item.field_type}</Text>

        <View style={styles.fieldFooter}>
          <Text style={styles.fieldPrice}>{item.price_per_hour?.toLocaleString()}đ/h</Text>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#22C55E' : '#EF4444' }]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      {loading ? (
        <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={fields}
          renderItem={renderFieldItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="construct-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có sân nào trong danh sách</Text>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => router.push("/owner/add-field")}
              >
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
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    ...getShadow(0.05, 8, 3),
  },
  fieldImage: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#F1F5F9' },
  fieldInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldName: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 },
  editBtn: { padding: 2 },
  sportBadge: { alignSelf: 'flex-start', backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  sportText: { fontSize: 11, fontWeight: '600', color: '#16A34A' },
  fieldType: { fontSize: 13, color: '#64748B', marginTop: 4 },
  fieldFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  fieldPrice: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 15, color: '#64748B', marginTop: 16, marginBottom: 20 },
  createBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: { color: '#fff', fontWeight: 'bold' }
});
