import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { router } from "expo-router";
import { notificationService } from "@/src/services/notification.service";

export default function NotificationsScreen() {
  const { darkMode } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("[Owner Notifications] Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const handleMarkRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return { name: 'calendar', color: '#3B82F6', bg: '#DBEAFE' };
      case 'payment': return { name: 'cash', color: '#22C55E', bg: '#DCFCE7' };
      case 'system': return { name: 'notifications', color: '#64748B', bg: '#F3F4F6' };
      default: return { name: 'notifications', color: '#22C55E', bg: '#DCFCE7' };
    }
  };

  const renderItem = ({ item }: any) => {
    const icon = getIcon(item.type);
    return (
      <TouchableOpacity
        style={[styles.notifItem, darkMode && { backgroundColor: "#1F2937", borderBottomColor: "#374151" }, !item.is_read && styles.unread]}
        onPress={() => handleMarkRead(item._id, item.is_read)}
      >
        <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
          <Ionicons
            name={icon.name as any}
            size={20}
            color={icon.color}
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, darkMode && { color: "#fff" }, !item.is_read && { fontWeight: 'bold' }]}>{item.title}</Text>
          <Text style={[styles.body, darkMode && { color: "#9CA3AF" }]} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
        </View>
        {!item.is_read && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <View style={[styles.header, darkMode && { borderBottomColor: "#374151" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={darkMode ? "#fff" : "#1E293B"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && { color: "#fff" }]}>Thông báo</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markRead}>Đã đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, darkMode && { color: "#9CA3AF" }]}>Không có thông báo mới</Text>
            </View>
          }
        />
      )}
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
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#9CA3AF' }
});
