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
import { useRouter } from "expo-router";

import { useAuthStore } from "@/src/store/auth.store";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (email === "admin@gmail.com" && password === "123456") {
      router.replace("/(user)");
      return;
    }

    Alert.alert("Lỗi", "Sai tài khoản hoặc mật khẩu");
  };

//   const handleLogin = async () => {
//     if (!validateEmail(email)) {
//       return Alert.alert("Lỗi", "Email không hợp lệ");
//     }
//
//     if (!password) {
//       return Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
//     }
//
//     try {
//       setLoading(true);
//       const res = await loginApi(email, password);
//
//       setAuth(res.user, res.token);
//
//       router.replace("/(tabs)");
//     } catch (err) {
//       Alert.alert("Lỗi", "Sai tài khoản hoặc mật khẩu");
//     } finally {
//       setLoading(false);
//     }
//   };

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
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

//         {/* Forgot */}
//         <TouchableOpacity style={{ alignSelf: "flex-end" }}>
//           <Text style={styles.forgot}>Quên mật khẩu?</Text>
//         </TouchableOpacity>

        {/* Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Text>
        </TouchableOpacity>

        {/* Switch */}
        <View style={styles.switchBox}>
          <Text style={styles.switchText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.switchLink}>Đăng ký</Text>
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
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
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  inputWrapper: {
    marginBottom: 14,
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
    zIndex: 1,
  },

  iconRight: {
    position: "absolute",
    right: 14,
  },

  forgot: {
    color: "#22C55E",
    fontSize: 14,
    marginBottom: 10,
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