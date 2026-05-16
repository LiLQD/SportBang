import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { getShadow } from "@/src/utils/style";

export default function MyFieldsScreen() {
  const router = useRouter();
  const { darkMode } = useAuthStore();
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyFields = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setTimeout(() => {
        setFields([
          {
            _id: "1",
            field_name: "Sân bóng Duy Tân",
            address: "15 Duy Tân, Cầu Giấy, Hà Nội",
            price_per_hour: 300000,
            images: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018"],
            status: "active",
            users_rate: 4.8
          },
          {
            _id: "2",
            field_name: "Sân bóng Đại học FPT",
            address: "Khu CNC Hòa Lạc, Thạch Thất",
            price_per_hour: 450000,
            images: ["https://images.unsplash.com/photo-1529900748604-07564a03e7a6"],
            status: "active",
            users_rate: 4.5
          }
        ]);
        setLoading(false);
        setRefreshing(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching my fields:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyFields();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyFields();
  };

  const renderFieldItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.fieldCard, darkMode && { backgroundColor: "#1F2937" }]}
      onPress={() => router.push(`/field/${item._id}`)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.fieldImage} />
      <View style={styles.fieldInfo}>
        <View style={styles.fieldHeader}>
          <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>{item.field_name}</Text>
          <View style={styles.statusBadge}>
             <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#22C55E' : '#EF4444' }]} />
             <Text style={[styles.statusText, darkMode && { color: "#9CA3AF" }]}>{item.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</Text>
          </View>
        </View>
        <Text style={[styles.address, darkMode && { color: "#9CA3AF" }]} numberOfLines={1}>
          <Ionicons name="location-outline" size={12} /> {item.address}
        </Text>
        <View style={styles.fieldFooter}>
          <Text style={styles.price}>{item.price_per_hour.toLocaleString('vi-VN')}đ<Text style={styles.unit}>/giờ</Text></Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color="#22C55E" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <View>
          <Text style={styles.headerTitle}>Sân bóng của tôi</Text>
          <Text style={[styles.headerSubtitle, darkMode && { color: "#A7F3D0" }]}>Quản lý và cập nhật thông tin sân</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={28} color="#22C55E" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={fields}
          keyExtractor={(item) => item._id}
          renderItem={renderFieldItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="football-outline" size={80} color={darkMode ? "#1F2937" : "#E2E8F0"} />
              <Text style={[styles.emptyText, darkMode && { color: "#9CA3AF" }]}>Bạn chưa đăng ký sân bóng nào</Text>
              <TouchableOpacity style={styles.createBtn}>
                <Text style={styles.createBtnText}>Đăng ký ngay</Text>
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
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#DCFCE7', marginTop: 4 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    ...getShadow(0.05, 10, 3),
  },
  fieldImage: { width: '100%', height: 160 },
  fieldInfo: { padding: 16 },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fieldName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: '#64748B' },
  address: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  fieldFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#22C55E' },
  unit: { fontSize: 13, fontWeight: 'normal', color: '#64748B' },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: '#64748B', marginTop: 15, marginBottom: 20 },
  createBtn: { backgroundColor: '#22C55E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  createBtnText: { color: '#fff', fontWeight: 'bold' },
});
