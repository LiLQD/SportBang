import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { registerApi } from "@/src/services/auth.service";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      return Alert.alert("Lỗi", "Mật khẩu không khớp");
    }

    try {
      await registerApi(form);
      Alert.alert("Thành công", "Đăng ký thành công");
      router.replace("/login");
    } catch {
      Alert.alert("Lỗi", "Đăng ký thất bại");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox} />
          <Text style={styles.appName}>SportBang</Text>
        </View>

        {/* Title */}
        <View style={styles.titleBox}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Điền thông tin để bắt đầu</Text>
        </View>

        {/* Name */}
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Họ tên"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, name: v })}
          />
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />
        </View>

        {/* Phone */}
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Số điện thoại"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, phone: v })}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, password: v })}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Xác nhận mật khẩu"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showConfirm}
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
          />
          <TouchableOpacity
            onPress={() => setShowConfirm(!showConfirm)}
            style={styles.iconRight}
          >
            <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>

        {/* Switch */}
        <View style={styles.switchBox}>
          <Text style={styles.switchText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.switchLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 24,
    elevation: 5,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },

  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: "#22C55E",
    borderRadius: 16,
    marginBottom: 8,
  },

  appName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0F172A",
  },

  titleBox: {
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },

  inputWrapper: {
    marginBottom: 12,
    justifyContent: "center",
  },

  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 15,
    color: "#0F172A",
  },

  iconLeft: {
    position: "absolute",
    left: 14,
  },

  iconRight: {
    position: "absolute",
    right: 14,
  },

  button: {
    height: 56,
    backgroundColor: "#22C55E",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  switchBox: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  switchText: {
    color: "#64748B",
    fontSize: 14,
  },

  switchLink: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "600",
  },
});