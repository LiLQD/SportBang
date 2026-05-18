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

export default function AdminUsers() {
  const { darkMode } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await adminService.getAllUsers();
      if (res.success) {
        setUsers(res.data || []);
      } else {
        Alert.alert("Thông báo", res.message || "Không thể lấy danh sách người dùng");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      Alert.alert("Lỗi kết nối", "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  const handleBlockUser = (user: any) => {
    const action = user.status === 'blocked' ? 'bỏ chặn' : 'chặn';

    const performAction = async () => {
        try {
            await adminService.blockUser(user._id);
            fetchUsers();
        } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Thao tác thất bại");
        }
    };

    Alert.alert(
      "Xác nhận",
      `Bạn có chắc chắn muốn ${action} người dùng ${user.full_name || 'này'}?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xác nhận", onPress: performAction }
      ]
    );
  };

  const handleDeleteUser = (user: any) => {
    const performDelete = async () => {
        try {
            await adminService.deleteUser(user._id);
            fetchUsers();
        } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Xóa thất bại");
        }
    };

    Alert.alert(
      "Cảnh báo",
      `Bạn có chắc chắn muốn xóa người dùng ${user.full_name || 'này'}? Hành động này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: performDelete }
      ]
    );
  };

  // Lọc an toàn hơn, tránh lỗi nếu các trường bị null/undefined
  const filteredUsers = users.filter(user => {
    const name = (user.full_name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || "");
    const query = searchQuery.toLowerCase();

    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={[styles.userCard, darkMode && { backgroundColor: "#1F2937" }]}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.full_name || "U").substring(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.userName, darkMode && { color: "#fff" }]}>{item.full_name || "N/A"}</Text>
          <Text style={styles.userSub}>{item.email || "No email"}</Text>
          <Text style={styles.userSub}>
            {item.phone || "No phone"} • Role: <Text style={{fontWeight: '600', color: '#16a34a'}}>{item.role || 'user'}</Text>
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={{ fontSize: 10, color: item.status === 'active' ? '#166534' : '#991B1B', fontWeight: 'bold' }}>
                {(item.status || 'active').toUpperCase()}
            </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
            style={[styles.btn, { backgroundColor: item.status === 'blocked' ? '#10B981' : '#F59E0B' }]}
            onPress={() => handleBlockUser(item)}
        >
            <Ionicons name={item.status === 'blocked' ? "lock-open-outline" : "lock-closed-outline"} size={16} color="#fff" />
            <Text style={styles.btnText}>{item.status === 'blocked' ? 'Unblock' : 'Block'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#EF4444' }]}
            onPress={() => handleDeleteUser(item)}
        >
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, darkMode && { backgroundColor: "#1F2937", borderColor: "#374151" }]}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            placeholder="Tìm kiếm theo tên, email hoặc SĐT..."
            placeholderTextColor="#94A3B8"
            style={[styles.searchInput, darkMode && { color: "#fff" }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderUserItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 50 }} />
          ) : (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Ionicons name="people-outline" size={60} color="#CBD5E1" />
                <Text style={styles.emptyText}>Không có dữ liệu người dùng</Text>
                <TouchableOpacity onPress={fetchUsers} style={{ marginTop: 10 }}>
                    <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>Thử tải lại</Text>
                </TouchableOpacity>
            </View>
          )
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
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...getShadow(0.05, 10, 3),
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16a34a20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#16a34a' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  userSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  actionRow: { flexDirection: 'row', marginTop: 16, gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 10, color: '#94A3B8', fontSize: 16 }
});
