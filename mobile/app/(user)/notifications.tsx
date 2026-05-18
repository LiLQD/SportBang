import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";

import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { notificationService } from "@/src/services/notification.service";
import { getShadow } from "@/src/utils/style";

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      // Backend trả về { success: true, message: ..., data: [...] }
      if (res && res.data) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("[Notification] Error:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return { name: 'calendar', color: '#3B82F6', bg: '#DBEAFE' };
      case 'payment': return { name: 'card', color: '#22C55E', bg: '#DCFCE7' };
      case 'system': return { name: 'alert-circle', color: '#F59E0B', bg: '#FEF3C7' };
      default: return { name: 'notifications', color: '#22C55E', bg: '#DCFCE7' };
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const icon = getIcon(item.type);
    return (
      <TouchableOpacity
        style={[styles.card, !item.is_read && styles.unread]}
        onPress={() => {
          if (!item.is_read) {
            notificationService.markAsRead(item._id);
            // Cập nhật local state để UI thay đổi ngay lập tức
            setNotifications(notifications.map(n => n._id === item._id ? {...n, is_read: true} : n));
          }
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#22C55E" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        ListEmptyComponent={<Text style={styles.empty}>Không có thông báo mới</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  screenTitle: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  card: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, ...getShadow(0.04, 10, 2) },
  unread: { backgroundColor: '#F0FDF4' },
  iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  message: { color: '#6B7280', fontSize: 14, marginBottom: 4 },
  time: { color: '#9CA3AF', fontSize: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', alignSelf: 'center', marginLeft: 8 },
  empty: { textAlign: 'center', marginTop: 100, color: '#9CA3AF' }
});
