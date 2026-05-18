import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { router } from "expo-router";
import { getShadow } from "@/src/utils/style";

export default function OwnerProfile() {
  const { user, logout, darkMode, toggleDarkMode } = useAuthStore();

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await logout();
        router.replace("/(auth)/login");
      } catch (err) {
        console.error("Logout error:", err);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        await performLogout();
      }
    } else {
      Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: performLogout },
      ]);
    }
  };

  const MenuItem = ({ icon, label, onPress, color = "#22C55E", rightElement }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, darkMode && { borderBottomColor: "#374151" }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.menuLabel, darkMode && { color: "#fff" }]}>{label}</Text>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.full_name?.[0]?.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.full_name}</Text>
        <Text style={styles.userRole}>Chủ sân bóng (Owner)</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Tài khoản</Text>
        <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
          <MenuItem icon="person-outline" label="Thông tin cá nhân" onPress={() => {}} />
          <MenuItem icon="business-outline" label="Thông tin doanh nghiệp" onPress={() => {}} />
          <MenuItem icon="card-outline" label="Tài khoản ngân hàng" onPress={() => {}} />
        </View>

        <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Cài đặt</Text>
        <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
          <MenuItem
            icon="moon-outline"
            label="Chế độ tối"
            color="#F59E0B"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#D1D5DB", true: "#22C55E" }}
              />
            }
          />
          <MenuItem icon="notifications-outline" label="Thông báo" color="#3B82F6" onPress={() => router.push("/(owner)/notifications" as any)} />
          <MenuItem icon="shield-checkmark-outline" label="Bảo mật" color="#10B981" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Phiên bản 1.0.0 (SportBang Business)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#22C55E",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#22C55E' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  userRole: { fontSize: 14, color: '#DCFCE7', marginTop: 4 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12, marginTop: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    ...getShadow(0.05, 10, 3),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuLabel: { fontSize: 15, fontWeight: '500', color: '#334155' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    gap: 10,
  },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
  version: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 30, marginBottom: 20 }
});
