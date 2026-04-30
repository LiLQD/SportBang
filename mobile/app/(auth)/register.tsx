import { View } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useState } from "react";

export default function RegisterScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>

      <Text variant="headlineMedium" style={{ textAlign: "center", marginBottom: 20 }}>
        Tạo tài khoản
      </Text>

      <TextInput
        label="Họ tên"
        mode="outlined"
        left={<TextInput.Icon icon="account" />}
        style={{ marginBottom: 10 }}
      />

      <TextInput
        label="Email"
        mode="outlined"
        left={<TextInput.Icon icon="email" />}
        style={{ marginBottom: 10 }}
      />

      <TextInput
        label="Số điện thoại"
        mode="outlined"
        left={<TextInput.Icon icon="phone" />}
        style={{ marginBottom: 10 }}
      />

      <TextInput
        label="Mật khẩu"
        mode="outlined"
        secureTextEntry
        left={<TextInput.Icon icon="lock" />}
        style={{ marginBottom: 10 }}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        label="Xác nhận mật khẩu"
        mode="outlined"
        secureTextEntry
        left={<TextInput.Icon icon="lock-check" />}
        style={{ marginBottom: 20 }}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button mode="contained" onPress={() => {}}>
        Đăng ký
      </Button>

    </View>
  );
}