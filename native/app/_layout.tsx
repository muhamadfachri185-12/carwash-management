import { useEffect } from "react"
import { Stack, useRouter } from "expo-router"
import { ActivityIndicator, View } from "react-native"

import { AuthProvider, useAuth } from "../context/AuthContext"

function RootContent() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      return
    }

    if (isAuthenticated) {
      router.replace("/orders")
    } else {
      router.replace("/login")
    }
  }, [isAuthenticated, loading])

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size='large' />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(auth)' />
      <Stack.Screen name='(tabs)' />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  )
}
