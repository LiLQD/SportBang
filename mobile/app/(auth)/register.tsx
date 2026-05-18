import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/src/services/auth.service";
import { useRouter } from "expo-router";
import { getShadow } from "@/src/utils/style";
import { Toast, ToastType } from "@/src/components/Toast";

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const validate = () => {
    let newErrors: any = {};
    if (!form.full_name) newErrors.full_name = "Vui lòng nhập họ tên";
    if (!form.email) newErrors.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email không hợp lệ";

    if (!form.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 6) newErrors.password = "Mật khẩu tối thiểu 6 ký tự";

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setErrors({});
    if (!validate()) return;

    try {
      setLoading(true);
      // Đăng ký mặc định role là customer trên mobile
      await authService.register({ ...form, role: 'customer' });

      // Thay vì Alert, ta có thể chuyển hướng kèm thông báo hoặc dùng toast ở màn login
      router.replace({
        pathname: "/(auth)/login",
        params: { registered: "true" }
      });
    } catch (err: any) {
      setErrors({ general: err.message || "Đăng ký thất bại" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>

        <View style={styles.logoContainer}>
          <View style={styles.logoBox} />
          <Text style={styles.appName}>SportBang</Text>
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Điền thông tin để bắt đầu</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={errors.full_name ? "#EF4444" : "#64748B"} style={styles.iconLeft} />
          <TextInput
            placeholder="Họ tên *"
            placeholderTextColor="#94A3B8"
            style={[styles.input, errors.full_name && styles.inputError]}
            value={form.full_name}
            onChangeText={(v) => {
              setForm({ ...form, full_name: v });
              if (errors.full_name) setErrors({ ...errors, full_name: undefined });
            }}
          />
          {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color={errors.email ? "#EF4444" : "#64748B"} style={styles.iconLeft} />
          <TextInput
            placeholder="Email *"
            placeholderTextColor="#94A3B8"
            style={[styles.input, errors.email && styles.inputError]}
            value={form.email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(v) => {
              setForm({ ...form, email: v });
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Số điện thoại"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(v) => setForm({ ...form, phone: v })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={errors.password ? "#EF4444" : "#64748B"} style={styles.iconLeft} />
          <TextInput
            placeholder="Mật khẩu *"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            style={[styles.input, errors.password && styles.inputError]}
            value={form.password}
            onChangeText={(v) => {
              setForm({ ...form, password: v });
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconRight}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#64748B" />
          </TouchableOpacity>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={errors.confirmPassword ? "#EF4444" : "#64748B"} style={styles.iconLeft} />
          <TextInput
            placeholder="Xác nhận mật khẩu *"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showConfirm}
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            value={form.confirmPassword}
            onChangeText={(v) => {
              setForm({ ...form, confirmPassword: v });
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
            }}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.iconRight}>
            <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#64748B" />
          </TouchableOpacity>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        {errors.general && (
          <View style={styles.generalErrorBox}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchBox}>
          <Text style={styles.switchText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.switchLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>

      </View>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 24,
    ...getShadow(0.05, 10, 5),
  },
  logoContainer: { alignItems: "center", marginBottom: 12 },
  logoBox: { width: 48, height: 48, backgroundColor: "#22C55E", borderRadius: 12, marginBottom: 8 },
  appName: { fontSize: 24, fontWeight: "bold", color: "#0F172A" },
  titleBox: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: "#0F172A" },
  subtitle: { fontSize: 14, color: "#64748B" },
  inputWrapper: { marginBottom: 12, justifyContent: "center" },
  input: { height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: "#E2E8F0", paddingLeft: 44, paddingRight: 44, fontSize: 15, color: "#0F172A" },
  inputError: { borderColor: "#EF4444" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4, marginLeft: 4 },
  generalErrorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 16 },
  generalErrorText: { color: "#EF4444", fontSize: 13, marginLeft: 8, flex: 1 },
  iconLeft: { position: "absolute", left: 14, top: 16, zIndex: 1 },
  iconRight: { position: "absolute", right: 14, zIndex: 1 },
  button: { height: 52, backgroundColor: "#22C55E", borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  switchBox: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  switchText: { color: "#64748B", fontSize: 14 },
  switchLink: { color: "#22C55E", fontSize: 14, fontWeight: "600" },
});
