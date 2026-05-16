import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                contentStyle: {
                    backgroundColor: "#F8FAFC",
                },
            }}
        >
            <Stack.Screen
                name="login"
                options={{
                    title: "Đăng nhập",
                }}
            />

            <Stack.Screen
                name="register"
                options={{
                    title: "Đăng ký",
                }}
            />
        </Stack>
    );
}