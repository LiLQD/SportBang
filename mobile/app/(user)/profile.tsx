import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";

import { useState } from "react";

import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [darkMode, setDarkMode] =
    useState(false);

  const stats = [
    {
      icon: "calendar-outline",
      label: "Bookings",
      value: "24",
    },

    {
      icon: "heart-outline",
      label: "Favorites",
      value: "8",
    },

    {
      icon: "wallet-outline",
      label: "Spent",
      value: "$480",
    },
  ];

  const menuItems = [
    {
      icon: "receipt-outline",
      label: "Payment History",
    },

    {
      icon: "heart-outline",
      label: "Favorite Fields",
    },
  ];

  const settingsItems = [
    {
      icon: "lock-closed-outline",
      label: "Change Password",
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
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View style={styles.header}>

        {/* AVATAR */}
        <View style={styles.avatarWrapper}>

          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={50}
              color="#22C55E"
            />
          </View>

          <TouchableOpacity
            style={styles.editButton}
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
          John Anderson
        </Text>

        <Text style={styles.email}>
          john.anderson@email.com
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsCard}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={styles.statItem}
          >
            <View style={styles.statIconBox}>
              <Ionicons
                name={stat.icon as any}
                size={24}
                color="#22C55E"
              />
            </View>

            <Text style={styles.statValue}>
              {stat.value}
            </Text>

            <Text style={styles.statLabel}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* MEMBERSHIP */}
      <View style={styles.membershipCard}>

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
                style={styles.membershipSmall}
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
              style={styles.membershipSmall}
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
              style={styles.progressText}
            >
              Progress to Platinum
            </Text>

            <Text
              style={styles.progressText}
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
        <View style={styles.card}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      {/* SETTINGS */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Settings
        </Text>

        <View style={styles.card}>
          {settingsItems.map(renderMenuItem)}

          {/* DARK MODE */}
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIconBox,
                  {
                    backgroundColor:
                      "#F3F4F6",
                  },
                ]}
              >
                <Ionicons
                  name="moon-outline"
                  size={22}
                  color="#6B7280"
                />
              </View>

              <Text style={styles.menuLabel}>
                Dark Mode
              </Text>
            </View>

            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
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
        style={styles.logoutButton}
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
});