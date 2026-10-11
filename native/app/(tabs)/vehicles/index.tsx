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
import { Vehicle, Customer } from "../../../types/order"
import { Ionicons } from "@expo/vector-icons"

export default function VehicleScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [vehRes, custRes] = await Promise.all([
        api.get("/vehicles"),
        api.get("/customers"),
      ])

      setVehicles(vehRes.data.vehicles)
      setCustomers(custRes.data.customers)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const getCustomerName = (customerId: number) => {
    return customers.find((c) => c.id === customerId)?.name || "Unknown"
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()

    return (
      vehicle.plateNumber.toLowerCase().includes(query) ||
      vehicle.brand.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query)
    )
  })

  const handleDelete = async (vehicle: Vehicle) => {
    Alert.alert("Konfirmasi Hapus", `Hapus kendaraan ${vehicle.plateNumber}?`, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/vehicles/${vehicle.id}`)
            fetchData()
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.response?.data?.message || "Gagal menghapus kendaraan",
            )
          }
        },
      },
    ])
  }

  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    return (
      <TouchableOpacity
        className='p-4 mb-3 bg-white rounded-xl'
        onPress={() =>
          router.push({
            pathname: "/(tabs)/vehicles/[id]",
            params: {
              id: item.id.toString(),
            },
          })
        }
      >
        {/* BAGIAN ATAS CARD */}
        <View className='flex-row items-center gap-3'>
          <View className='px-2 py-1 rounded-md bg-yellow-200 border border-yellow-300'>
            <Text className='text-xs font-bold text-yellow-900'>
              {item.plateNumber}
            </Text>
          </View>

          <View className='flex-1'>
            <Text className='text-base font-semibold text-gray-900'>
              {item.brand} {item.model}
            </Text>

            <Text className='mt-0.5 text-[13px] text-gray-500'>
              {getCustomerName(item.customerId)}
            </Text>
          </View>

          <Ionicons name='chevron-forward' size={20} color='#9ca3af' />
        </View>

        {/* BAGIAN BAWAH CARD */}
        <View className='flex-row justify-end gap-4 mt-3 pt-3 border-t border-gray-200'>
          <TouchableOpacity
            className='flex-row items-center gap-1'
            onPress={() =>
              router.push({
                pathname: "/(tabs)/vehicles/[id]",
                params: {
                  id: item.id.toString(),
                },
              })
            }
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
      {/* SEARCH */}
      <View className='flex-row items-center gap-2 mx-4 mt-2 px-4 py-3 bg-white rounded-xl border border-gray-200'>
        <Ionicons name='search' size={20} color='#9ca3af' />

        <TextInput
          className='flex-1 text-sm text-gray-900'
          placeholder='Cari plat nomor atau merek...'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* LIST VEHICLE */}
      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicleCard}
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
            <Ionicons name='car-outline' size={48} color='#d1d5db' />

            <Text className='mt-3 text-sm text-gray-500'>
              {searchQuery
                ? "Tidak ada hasil pencarian"
                : "Belum ada kendaraan"}
            </Text>
          </View>
        }
      />

      {/* BUTTON TAMBAH */}
      <TouchableOpacity
        className='absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center'
        onPress={() => router.push("/(tabs)/vehicles/new")}
      >
        <Ionicons name='add' size={24} color='#fff' />
      </TouchableOpacity>
    </View>
  )
}
