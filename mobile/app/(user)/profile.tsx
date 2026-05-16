import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";

import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { useRouter, useFocusEffect } from "expo-router";
import { authService } from "@/src/services/auth.service";

export default function ProfileScreen() {
  const { user, logout, setAuth, token, darkMode, toggleDarkMode } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [realStats, setRealStats] = useState({ bookings: 0, favorites: 0, spent: 0 });

  // Edit State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || "");
  const [editPhone, setEditPhone] = useState("");

  // Change Password State
  const [isChangePassModalVisible, setIsChangePassModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getProfile();
      if (res && res.data) {
        setRealStats(res.data.stats || { bookings: 0, favorites: 0, spent: 0 });
        setEditPhone(res.data.phone || "");
        // Cập nhật lại user trong store nếu có thay đổi
        if (token) setAuth(res.data, token);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await authService.updateProfile({
        full_name: editName,
        phone: editPhone
      });
      if (res && res.data) {
        Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân");
        setIsEditModalVisible(false);
        fetchProfile();
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsChangingPass(true);
      const res = await authService.changePassword({ oldPassword, newPassword });
      if (res && res.success) {
        Alert.alert("Thành công", "Đổi mật khẩu thành công");
        setIsChangePassModalVisible(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Lỗi", res.message || "Không thể đổi mật khẩu");
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      Alert.alert("Lỗi", error.message || "Mật khẩu cũ không chính xác");
    } finally {
      setIsChangingPass(false);
    }
  };

  const stats = [
    {
      icon: "calendar-outline",
      label: "Bookings",
      value: realStats.bookings.toString(),
    },
    {
      icon: "heart-outline",
      label: "Favorites",
      value: realStats.favorites.toString(),
    },
    {
      icon: "wallet-outline",
      label: "Spent",
      value: realStats.spent.toLocaleString('vi-VN') + "đ",
    },
  ];

  const menuItems = [
    {
      icon: "receipt-outline",
      label: "Payment History",
      onPress: () => router.push("/(user)/payments"),
    },
    {
      icon: "heart-outline",
      label: "Favorite Fields",
      onPress: () => router.push("/(user)/favorites"),
    },
  ];

  const settingsItems = [
    {
      icon: "lock-closed-outline",
      label: "Change Password",
      onPress: () => setIsChangePassModalVisible(true),
    },
  ];

  const renderMenuItem = (
    item: any,
    index: number
  ) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.menuItem}
        activeOpacity={0.7}
        onPress={item.onPress}
      >
        <View style={styles.menuLeft}>
          <View style={styles.menuIconBox}>
            <Ionicons
              name={item.icon as any}
              size={22}
              color="#22C55E"
            />
          </View>

          <Text style={styles.menuLabel}>
            {item.label}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, darkMode && { backgroundColor: "#111827" }]}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>

        {/* AVATAR */}
        <View style={styles.avatarWrapper}>

          <View style={[styles.avatar, darkMode && { backgroundColor: "#1F2937" }]}>
            <Ionicons
              name="person"
              size={50}
              color="#22C55E"
            />
          </View>

          <TouchableOpacity
            style={[styles.editButton, darkMode && { backgroundColor: "#1F2937", borderColor: "#065F46" }]}
            onPress={() => setIsEditModalVisible(true)}
          >
            <Ionicons
              name="pencil"
              size={16}
              color="#22C55E"
            />
          </TouchableOpacity>
        </View>

        {/* INFO */}
        <Text style={styles.userName}>
          {user?.full_name || "Guest User"}
        </Text>

        <Text style={[styles.email, darkMode && { color: "#A7F3D0" }]}>
          {user?.email || "No email provided"}
        </Text>
      </View>

      {/* STATS */}
      <View style={[styles.statsCard, darkMode && { backgroundColor: "#1F2937" }]}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={styles.statItem}
          >
            <View style={[styles.statIconBox, darkMode && { backgroundColor: "#065F46" }]}>
              <Ionicons
                name={stat.icon as any}
                size={24}
                color="#22C55E"
              />
            </View>

            <Text style={[styles.statValue, darkMode && { color: "#fff" }]}>
              {stat.value}
            </Text>

            <Text style={[styles.statLabel, darkMode && { color: "#9CA3AF" }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* MEMBERSHIP */}
      <View style={[styles.membershipCard, darkMode && { backgroundColor: "#065F46" }]}>

        <View style={styles.membershipTop}>
          <View style={styles.membershipLeft}>
            <View
              style={styles.membershipIconBox}
            >
              <Ionicons
                name="trophy-outline"
                size={28}
                color="#fff"
              />
            </View>

            <View>
              <Text
                style={[styles.membershipSmall, darkMode && { color: "#A7F3D0" }]}
              >
                Membership Level
              </Text>

              <Text
                style={styles.membershipTitle}
              >
                Gold Member
              </Text>
            </View>
          </View>

          <View>
            <Text
              style={[styles.membershipSmall, darkMode && { color: "#A7F3D0" }]}
            >
              Points
            </Text>

            <Text
              style={styles.membershipPoints}
            >
              1,250
            </Text>
          </View>
        </View>

        {/* PROGRESS */}
        <View style={styles.progressSection}>

          <View style={styles.progressRow}>
            <Text
              style={[styles.progressText, darkMode && { color: "#A7F3D0" }]}
            >
              Progress to Platinum
            </Text>

            <Text
              style={[styles.progressText, darkMode && { color: "#A7F3D0" }]}
            >
              250 points to go
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={styles.progressFill}
            />
          </View>
        </View>
      </View>

      {/* MENU */}
      <View style={styles.section}>
        <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, darkMode && { borderBottomColor: "#374151" }]}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, darkMode && { backgroundColor: "#064E3B" }]}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color="#22C55E"
                  />
                </View>

                <Text style={[styles.menuLabel, darkMode && { color: "#fff" }]}>
                  {item.label}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SETTINGS */}
      <View style={styles.section}>

        <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>
          Settings
        </Text>

        <View style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, darkMode && { borderBottomColor: "#374151" }]}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, darkMode && { backgroundColor: "#064E3B" }]}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color="#22C55E"
                  />
                </View>

                <Text style={[styles.menuLabel, darkMode && { color: "#fff" }]}>
                  {item.label}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          ))}

          {/* DARK MODE */}
          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIconBox,
                  {
                    backgroundColor: darkMode ? "#064E3B" : "#DCFCE7",
                  },
                ]}
              >
                <Ionicons
                  name="moon-outline"
                  size={22}
                  color={darkMode ? "#FBBF24" : "#22C55E"}
                />
              </View>

              <Text style={[styles.menuLabel, darkMode && { color: "#fff" }]}>
                Dark Mode
              </Text>
            </View>

            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{
                false: "#D1D5DB",
                true: "#22C55E",
              }}
            />
          </View>
        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        style={[styles.logoutButton, darkMode && { backgroundColor: "#1F2937" }]}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color="#EF4444"
        />

        <Text style={styles.logoutText}>
          Log Out
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* EDIT MODAL */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && { backgroundColor: "#1F2937" }]}>
            <Text style={[styles.modalTitle, darkMode && { color: "#fff" }]}>Chỉnh sửa thông tin</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, darkMode && { color: "#D1D5DB" }]}>Họ và tên</Text>
              <TextInput
                style={[styles.input, darkMode && { backgroundColor: "#374151", borderColor: "#4B5563", color: "#fff" }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nhập tên của bạn"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, darkMode && { color: "#D1D5DB" }]}>Số điện thoại</Text>
              <TextInput
                style={[styles.input, darkMode && { backgroundColor: "#374151", borderColor: "#4B5563", color: "#fff" }]}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={{ color: darkMode ? '#D1D5DB' : '#4B5563' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#22C55E' }]}
                onPress={handleUpdateProfile}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal visible={isChangePassModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && { backgroundColor: "#1F2937" }]}>
            <Text style={[styles.modalTitle, darkMode && { color: "#fff" }]}>Đổi mật khẩu</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, darkMode && { color: "#D1D5DB" }]}>Mật khẩu cũ</Text>
              <TextInput
                style={[styles.input, darkMode && { backgroundColor: "#374151", borderColor: "#4B5563", color: "#fff" }]}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, darkMode && { color: "#D1D5DB" }]}>Mật khẩu mới</Text>
              <TextInput
                style={[styles.input, darkMode && { backgroundColor: "#374151", borderColor: "#4B5563", color: "#fff" }]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, darkMode && { color: "#D1D5DB" }]}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={[styles.input, darkMode && { backgroundColor: "#374151", borderColor: "#4B5563", color: "#fff" }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}
                onPress={() => setIsChangePassModalVisible(false)}
                disabled={isChangingPass}
              >
                <Text style={{ color: darkMode ? '#D1D5DB' : '#4B5563' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#22C55E' }]}
                onPress={handleChangePassword}
                disabled={isChangingPass}
              >
                {isChangingPass ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cập nhật</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    backgroundColor: "#22C55E",
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,

    width: 34,
    height: 34,
    borderRadius: 999,

    backgroundColor: "#fff",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#22C55E",
  },

  userName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },

  email: {
    color: "#DCFCE7",
    marginTop: 6,
  },

  statsCard: {
    marginHorizontal: 20,
    marginTop: -25,

    backgroundColor: "#fff",
    borderRadius: 24,

    paddingVertical: 24,

    flexDirection: "row",
    justifyContent: "space-around",

    elevation: 3,
  },

  statItem: {
    alignItems: "center",
  },

  statIconBox: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 10,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  membershipCard: {
    marginHorizontal: 20,
    marginTop: 20,

    backgroundColor: "#22C55E",
    borderRadius: 24,

    padding: 20,
  },

  membershipTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  membershipLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  membershipIconBox: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,
  },

  membershipSmall: {
    color: "#DCFCE7",
    fontSize: 12,
  },

  membershipTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },

  membershipPoints: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },

  progressSection: {
    marginTop: 20,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  progressText: {
    color: "#DCFCE7",
    fontSize: 12,
  },

  progressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },

  progressFill: {
    width: "83%",
    height: "100%",
    backgroundColor: "#fff",
  },

  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
  },

  menuItem: {
    minHeight: 64,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 18,

    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,
  },

  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },

  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,

    height: 58,

    borderRadius: 20,

    borderWidth: 2,
    borderColor: "#EF4444",

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 8,

    backgroundColor: "#fff",
  },

  logoutText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  }
});