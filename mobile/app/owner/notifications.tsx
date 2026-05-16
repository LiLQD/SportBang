import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { router } from "expo-router";

export default function NotificationsScreen() {
  const { darkMode } = useAuthStore();

  const notifications = [
    { id: 1, title: 'Đơn đặt mới', body: 'Khách hàng Nguyễn Văn A vừa đặt sân 5A lúc 18:00', time: '5 phút trước', type: 'booking', read: false },
    { id: 2, title: 'Thanh toán thành công', body: 'Đơn hàng #BK123 đã được thanh toán qua MoMo', time: '1 giờ trước', type: 'payment', read: true },
    { id: 3, title: 'Yêu cầu hủy sân', body: 'Sân 7B yêu cầu hủy lịch bảo trì ngày 20/10', time: '2 giờ trước', type: 'system', read: true },
  ];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={[styles.notifItem, darkMode && { backgroundColor: "#1F2937", borderBottomColor: "#374151" }, !item.read && styles.unread]}>
      <View style={[styles.iconBox, { backgroundColor: item.type === 'booking' ? '#DBEAFE' : item.type === 'payment' ? '#DCFCE7' : '#F3F4F6' }]}>
        <Ionicons
          name={item.type === 'booking' ? 'calendar' : item.type === 'payment' ? 'cash' : 'notifications'}
          size={20}
          color={item.type === 'booking' ? '#3B82F6' : item.type === 'payment' ? '#22C55E' : '#64748B'}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, darkMode && { color: "#fff" }, !item.read && { fontWeight: 'bold' }]}>{item.title}</Text>
        <Text style={[styles.body, darkMode && { color: "#9CA3AF" }]} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={darkMode ? "#fff" : "#1E293B"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && { color: "#fff" }]}>Thông báo</Text>
        <TouchableOpacity>
          <Text style={styles.markRead}>Đã đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  markRead: { color: '#22C55E', fontSize: 13, fontWeight: '600' },
  notifItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  unread: { backgroundColor: '#F8FAFC' },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: { flex: 1 },
  title: { fontSize: 15, color: '#1E293B' },
  body: { fontSize: 13, color: '#64748B', marginTop: 2 },
  time: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }
});
