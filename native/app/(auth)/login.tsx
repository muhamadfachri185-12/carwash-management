import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../../context/AuthContext"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi")
      return
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Format email tidak valid")
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      router.replace("/(tabs)/orders")
    } catch (error: any) {
      const errorMessage =
        error.response?.status === 401
          ? "Email atau password salah"
          : error.response?.data?.message
            ? error.response.data.message
            : error.message === "Network Error"
              ? "Gagal terhubung ke server. Periksa koneksi internet."
              : "Terjadi kesalahan. Silakan coba lagi."

      Alert.alert("Login Gagal", errorMessage)
    } finally {
      setLoading(false)
    }
  }
  return (
    <KeyboardAvoidingView
      className='flex-1 bg-gray-50'
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style='dark' />

      <View className='flex-1 justify-center px-6'>
        <View className='items-center mb-10'>
          <Text className='text-[32px] font-bold text-gray-900 mb-2'>
            WashFlow Staff
          </Text>
          <Text className='text-base text-gray-500'>Login ke akun Anda</Text>
        </View>

        <View className='gap-5'>
          <View className='gap-2'>
            <Text className='text-sm font-medium text-gray-700'>Email</Text>
            <TextInput
              className='h-12 px-4 text-base bg-white border border-gray-300 rounded-lg'
              placeholder='staff@carwash.com'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
              editable={!loading}
            />
          </View>

          <View className='gap-2'>
            <Text className='text-sm font-medium text-gray-700'>Password</Text>
            <View className='relative'>
              <TextInput
                className='h-12 px-4 pr-14 text-base bg-white border border-gray-300 rounded-lg'
                placeholder='Masukkan password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />

              <TouchableOpacity
                className='absolute right-0 top-0 h-12 w-12 items-center justify-center'
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color='#6b7280'
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className={`h-12 mt-3 rounded-lg items-center justify-center ${loading ? "bg-blue-400" : "bg-blue-600"}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text className='text-base font-semibold text-white'>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
