import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import { View, TouchableOpacity, Text, Alert } from "react-native"

export default function TabsLayout() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya, Keluar",
        style: "destructive",
        onPress: async () => {
          await logout()
        },
      },
    ])
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#6b7280",
        headerShown: true,
        headerStyle: {
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        },
        headerTintColor: "#111827",
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "600",
        },
        headerRight: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 16,
              gap: 8,
            }}
          >
            <View>
              <Text style={{ fontSize: 12, color: "#6b7280" }}>Staff</Text>
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}
              >
                {user?.name}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name='log-out-outline' size={24} color='#ef4444' />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name='orders'
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='clipboard-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='customers'
        options={{
          title: "Customers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='people-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='vehicles'
        options={{
          title: "Vehicles",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='car-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='history'
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='time-outline' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
