import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { useAuthStore } from "@/src/store/auth.store";

export default function RootLayout() {
  const token = useAuthStore((s) => s.token);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </PaperProvider>
  );
}