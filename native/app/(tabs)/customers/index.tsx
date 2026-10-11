import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native"
import { useRouter } from "expo-router"
import api from "../../../lib/api"
import { Customer } from "../../../types/order"
import { Ionicons } from "@expo/vector-icons"
import ErrorAlert from "../../../components/ErrorAlert"

export default function CustomerScreen() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorAlert, setErrorAlert] = useState("")

  const router = useRouter()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers")

      setCustomers(response.data.customers)
    } catch (error) {
      console.error("Error fetch data customers", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchCustomers()
  }

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()

    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    )
  })

  const handleDelete = async (customer: Customer) => {
    Alert.alert("Konfirmasi Hapus", `Hapus customer ${customer.name}?`, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)
            await api.delete(`/customers/${customer.id}`)
            fetchCustomers()
          } catch (error: any) {
            setErrorAlert(
              error.response?.data?.message || "Gagal menghapus customer",
            )
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const renderCustomerCard = ({ item }: { item: Customer }) => {
    return (
      <TouchableOpacity
        className='p-4 mb-3 bg-white rounded-xl'
        onPress={() => router.push(`/(tabs)/customers/${item.id}`)}
      >
        {/* BAGIAN ATAS CARD */}
        <View className='flex-row items-center gap-3'>
          <View className='w-11 h-11 rounded-full bg-blue-600 items-center justify-center'>
            <Text className='text-lg font-semibold text-white'>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View className='flex-1'>
            <Text className='text-base font-semibold text-gray-900'>
              {item.name}
            </Text>

            <Text className='mt-0.5 text-sm text-gray-500'>{item.phone}</Text>
          </View>

          <Ionicons name='chevron-forward' size={20} color='#9ca3af' />
        </View>

        {/* BAGIAN BAWAH CARD */}
        <View className='flex-row justify-end gap-4 mt-3 pt-3 border-t border-gray-200'>
          <TouchableOpacity
            className='flex-row items-center gap-1'
            onPress={() => router.push(`/(tabs)/customers/${item.id}`)}
          >
            <Ionicons name='create-outline' size={16} color='#2563eb' />

            <Text className='text-sm text-blue-600'>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row items-center gap-1'
            onPress={() => handleDelete(item)}
          >
            <Ionicons name='trash-outline' size={16} color='#ef4444' />

            <Text className='text-sm text-red-500'>Hapus</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  return (
    <View className='flex-1 bg-gray-50'>
      {errorAlert && (
        <ErrorAlert message={errorAlert} onDismiss={() => setErrorAlert("")} />
      )}

      {/* SEARCH */}
      <View className='flex-row items-center gap-2 mx-4 mt-2 px-4 py-3 bg-white rounded-xl border border-gray-200'>
        <Ionicons name='search' size={20} color='#9ca3af' />

        <TextInput
          className='flex-1 text-sm text-gray-900'
          placeholder='Cari nama atau telepon...'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* LIST CUSTOMER */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className='items-center p-10'>
            <Ionicons name='people-outline' size={48} color='#d1d5db' />

            <Text className='mt-3 text-sm text-gray-500'>
              {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada customer"}
            </Text>
          </View>
        }
      />

      {/* BUTTON TAMBAH */}
      <TouchableOpacity
        className='absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center'
        onPress={() => router.push("/(tabs)/customers/new")}
      >
        <Ionicons name='add' size={24} color='#fff' />
      </TouchableOpacity>
    </View>
  )
}
