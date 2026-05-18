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
  Platform,
  Modal,
  ScrollView,
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

  // Create User Modal State
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer"
  });

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

  const handleCreateUser = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.phone || !newUser.password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const res = await adminService.createUser(newUser);
      if (res.success) {
        if (Platform.OS === 'web') alert("Tạo người dùng thành công!");
        else Alert.alert("Thành công", "Tạo người dùng thành công!");
        setShowModal(false);
        setNewUser({ full_name: "", email: "", phone: "", password: "", role: "customer" });
        fetchUsers();
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể tạo người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = (user: any) => {
    const action = user.status === 'blocked' ? 'bỏ chặn' : 'chặn';

    const performAction = async () => {
      try {
        await adminService.blockUser(user._id);
        fetchUsers();
        if (Platform.OS === 'web') {
          alert(`Đã ${action} thành công!`);
        }
      } catch (error: any) {
        if (Platform.OS === 'web') {
          alert(error.message || "Thao tác thất bại");
        } else {
          Alert.alert("Lỗi", error.message || "Thao tác thất bại");
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc chắn muốn ${action} người dùng ${user.full_name || 'này'}?`)) {
        performAction();
      }
    } else {
      Alert.alert(
        "Xác nhận",
        `Bạn có chắc chắn muốn ${action} người dùng ${user.full_name || 'này'}?`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xác nhận", onPress: performAction }
        ]
      );
    }
  };

  const handleDeleteUser = (user: any) => {
    const performDelete = async () => {
      try {
        await adminService.deleteUser(user._id);
        fetchUsers();
        if (Platform.OS === 'web') {
          alert("Đã xóa người dùng thành công!");
        }
      } catch (error: any) {
        if (Platform.OS === 'web') {
          alert(error.message || "Xóa thất bại");
        } else {
          Alert.alert("Lỗi", error.message || "Xóa thất bại");
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.full_name || 'này'}? Hành động này không thể hoàn tác.`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        "Cảnh báo",
        `Bạn có chắc chắn muốn xóa người dùng ${user.full_name || 'này'}? Hành động này không thể hoàn tác.`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xóa", style: "destructive", onPress: performDelete }
        ]
      );
    }
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal Thêm người dùng */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && { backgroundColor: "#1F2937" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && { color: "#fff" }]}>Thêm người dùng mới</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={darkMode ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, darkMode && { color: "#94A3B8" }]}>Họ và tên</Text>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                value={newUser.full_name}
                onChangeText={(val) => setNewUser({ ...newUser, full_name: val })}
                placeholder="Ví dụ: Nguyễn Văn A"
                placeholderTextColor="#94A3B8"
              />

              <Text style={[styles.label, darkMode && { color: "#94A3B8" }]}>Email</Text>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                value={newUser.email}
                onChangeText={(val) => setNewUser({ ...newUser, email: val })}
                placeholder="example@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
              />

              <Text style={[styles.label, darkMode && { color: "#94A3B8" }]}>Số điện thoại</Text>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                value={newUser.phone}
                onChangeText={(val) => setNewUser({ ...newUser, phone: val })}
                placeholder="0912345678"
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
              />

              <Text style={[styles.label, darkMode && { color: "#94A3B8" }]}>Mật khẩu ban đầu</Text>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                value={newUser.password}
                onChangeText={(val) => setNewUser({ ...newUser, password: val })}
                placeholder="Tối thiểu 6 ký tự"
                secureTextEntry
                placeholderTextColor="#94A3B8"
              />

              <Text style={[styles.label, darkMode && { color: "#94A3B8" }]}>Vai trò (Role)</Text>
              <View style={styles.roleContainer}>
                {['customer', 'owner', 'admin'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleOption,
                      newUser.role === r && styles.roleActive,
                      darkMode && newUser.role === r && { borderColor: '#10B981' }
                    ]}
                    onPress={() => setNewUser({ ...newUser, role: r })}
                  >
                    <Text style={[
                      styles.roleText,
                      newUser.role === r && styles.roleTextActive,
                      darkMode && { color: newUser.role === r ? '#10B981' : '#94A3B8' }
                    ]}>
                      {r.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateUser}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Xác nhận tạo</Text>}
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  emptyText: { textAlign: 'center', marginTop: 10, color: '#94A3B8', fontSize: 16 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow(0.3, 5, 5),
    elevation: 5,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    padding: 24,
    ...getShadow(0.2, 15, 10),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalForm: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkInput: {
    backgroundColor: '#374151',
    color: '#fff',
    borderColor: '#4B5563',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  roleActive: {
    borderColor: '#16a34a',
    backgroundColor: '#DCFCE7',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
  },
  roleTextActive: {
    color: '#166534',
  },
  submitBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...getShadow(0.2, 8, 4),
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
