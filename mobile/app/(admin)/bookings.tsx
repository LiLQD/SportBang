import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

type Status = "pending" | "approved" | "cancelled";

interface Booking {
  id: string;
  user: string;
  field: string;
  date: string;
  time: string;
  status: Status;
}

const mockData: Booking[] = [
  {
    id: "1",
    user: "Nguyen Van A",
    field: "Sân A",
    date: "2026-05-05",
    time: "14:00 - 16:00",
    status: "pending",
  },
  {
    id: "2",
    user: "Tran Van B",
    field: "Sân B",
    date: "2026-05-06",
    time: "10:00 - 12:00",
    status: "approved",
  },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState(mockData);
  const [status, setStatus] = useState<Status | "all">("all");
  const [date, setDate] = useState("");

  const filtered = bookings.filter((b) => {
    const matchStatus = status === "all" || b.status === status;
    const matchDate = !date || b.date === date;
    return matchStatus && matchDate;
  });

  const updateStatus = (id: string, newStatus: Status) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: newStatus } : b
      )
    );
  };

  const getColor = (s: Status) => {
    switch (s) {
      case "pending":
        return "#f59e0b";
      case "approved":
        return "#16a34a";
      case "cancelled":
        return "#6b7280";
    }
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.user}</Text>
      <Text style={styles.cell}>{item.field}</Text>
      <Text style={styles.cell}>{item.date}</Text>
      <Text style={styles.cell}>{item.time}</Text>

      {/* STATUS */}
      <View
        style={[
          styles.badge,
          { backgroundColor: getColor(item.status) },
        ]}
      >
        <Text style={styles.badgeText}>{item.status}</Text>
      </View>

      {/* ACTION */}
      <View style={styles.actions}>
        {item.status === "pending" && (
          <>
            <TouchableOpacity
              onPress={() => updateStatus(item.id, "approved")}
            >
              <Ionicons name="checkmark" size={18} color="green" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateStatus(item.id, "cancelled")}
            >
              <Ionicons name="close" size={18} color="red" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Management</Text>

      {/* FILTER */}
      <View style={styles.filter}>
        <View style={styles.inputBox}>
          <Ionicons name="calendar-outline" size={16} />
          <TextInput
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.statusRow}>
          {["all", "pending", "approved", "cancelled"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s as any)}
              style={[
                styles.statusBtn,
                status === s && styles.active,
              ]}
            >
              <Text
                style={
                  status === s
                    ? styles.activeText
                    : styles.text
                }
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* HEADER TABLE */}
      <View style={styles.header}>
        <Text style={styles.cell}>User</Text>
        <Text style={styles.cell}>Field</Text>
        <Text style={styles.cell}>Date</Text>
        <Text style={styles.cell}>Time</Text>
        <Text style={styles.cell}>Status</Text>
        <Text style={styles.cell}>Action</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },

  filter: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },

  statusRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  statusBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  active: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },

  text: { color: "#333" },
  activeText: { color: "#fff" },

  header: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    alignItems: "center",
  },

  cell: {
    flex: 1,
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },
});