import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { useRouter } from "expo-router"
import api from "../../lib/api"
import { Order } from "../../types/order"
import { Ionicons } from "@expo/vector-icons"
import { TextInput } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

export default function HistoryScreen() {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchCompleteOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [completedOrders, searchQuery, startDate, endDate])

  const fetchCompleteOrders = async () => {
    try {
      setLoading(true)

      const response = await api.get("/orders")

      const completed = response.data.data.filter(
        (order: Order) => order.status === "COMPLETED",
      )

      setCompletedOrders(completed)
    } catch (error: any) {
      console.error("Error fetching completed orders:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filterOrders = () => {
    let result = completedOrders

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()

      result = result.filter(
        (order) =>
          order.customer?.name?.toLowerCase().includes(query) ||
          order.vehicle?.plateNumber?.toLowerCase().includes(query) ||
          order.orderCode?.toLowerCase().includes(query),
      )
    }

    // Filter tanggal mulai
    if (startDate) {
      result = result.filter((order) => {
        const orderDate = new Date(order.completedAt || order.createdAt)

        return orderDate >= startDate
      })
    }

    // Filter tanggal akhir
    if (endDate) {
      result = result.filter((order) => {
        const orderDate = new Date(order.completedAt || order.createdAt)

        // sampai akhir hari
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)

        return orderDate <= endOfDay
      })
    }

    setFilteredOrders(result)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchCompleteOrders()
  }

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PAID":
        return {
          bg: "#d1fae5",
          text: "#065f46",
        }

      case "UNPAID":
        return {
          bg: "#fee2e2",
          text: "#991b1b",
        }

      default:
        return {
          bg: "#e5e7eb",
          text: "#374151",
        }
    }
  }

  const renderOrderCard = ({ item }: { item: Order }) => {
    const paymentBadge = getPaymentBadge(item.paymentStatus)

    const completedDate = item.completedAt
      ? new Date(item.completedAt).toLocaleDateString("id-ID")
      : new Date(item.createdAt).toLocaleDateString("id-ID")

    return (
      <TouchableOpacity
        className='p-4 mb-3 bg-white rounded-xl border-l-4 border-l-emerald-500'
        onPress={() => router.push(`/(tabs)/orders/${item.id}`)}
      >
        {/* BAGIAN ATAS CARD */}
        <View className='flex-row justify-between items-start mb-3'>
          <View className='gap-1'>
            <Text className='text-base font-bold text-gray-900'>
              {item.orderCode}
            </Text>

            <Text className='text-xs text-gray-400'>{completedDate}</Text>
          </View>

          <View className='px-2.5 py-1 rounded-xl bg-emerald-200'>
            <Text className='text-[11px] font-semibold text-emerald-800'>
              COMPLETED
            </Text>
          </View>
        </View>

        {/* DETAIL ORDER */}
        <View className='gap-2 mb-3'>
          <View className='flex-row items-center gap-2'>
            <Ionicons name='person-outline' size={16} color='#6b7280' />

            <Text className='flex-1 text-sm text-gray-700' numberOfLines={1}>
              {item.customer?.name || "-"}
            </Text>
          </View>

          <View className='flex-row items-center gap-2'>
            <Ionicons name='car-outline' size={16} color='#6b7280' />

            <Text className='text-sm text-gray-700'>
              {item.vehicle?.plateNumber || "-"}
            </Text>
          </View>

          <View className='flex-row items-center gap-2'>
            <Ionicons name='list-outline' size={16} color='#6b7280' />

            <Text className='text-sm text-gray-700'>
              {item.orderItems.length} service
              {item.orderItems.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* TOTAL + PAYMENT */}
        <View className='flex-row justify-between items-center pt-3 mb-3 border-t border-gray-200'>
          <Text className='text-lg font-bold text-gray-900'>
            Rp {item.total.toLocaleString("id-ID")}
          </Text>

          <View
            className='px-2 py-1 rounded-lg'
            style={{ backgroundColor: paymentBadge.bg }}
          >
            <Text
              className='text-xs font-semibold'
              style={{ color: paymentBadge.text }}
            >
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        {/* ACTION */}
        <View className='flex-row justify-end pt-2 border-t border-gray-100'>
          <TouchableOpacity
            className='flex-row items-center gap-1 px-3 py-1.5'
            onPress={() => router.push(`/(tabs)/orders/${item.id}`)}
          >
            <Ionicons name='eye-outline' size={16} color='#2563eb' />

            <Text className='text-xs text-blue-600'>Lihat Detail</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Pilih tanggal"

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const renderFilterBar = () => (
    <View className='p-4 pt-2 gap-3'>
      {/* SEARCH */}
      <View className='flex-row items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200'>
        <Ionicons name='search' size={18} color='#9ca3af' />

        <TextInput
          className='flex-1 text-sm text-gray-900'
          placeholder='Cari customer, plat, atau kode...'
          placeholderTextColor='#9ca3af'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name='close-circle' size={18} color='#9ca3af' />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* FILTER TANGGAL */}
      <View className='flex-row gap-3'>
        {/* DARI TANGGAL */}
        <View className='flex-1'>
          <Text className='mb-1.5 text-xs font-medium text-gray-700'>
            Dari Tanggal
          </Text>

          <TouchableOpacity
            className='h-11 flex-row items-center justify-between px-3 bg-white rounded-lg border border-gray-200'
            onPress={() => setShowStartPicker(true)}
          >
            <Text
              className={`text-[13px] ${
                startDate ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {formatDate(startDate)}
            </Text>

            <Ionicons name='calendar-outline' size={18} color='#6b7280' />
          </TouchableOpacity>
        </View>

        {/* SAMPAI TANGGAL */}
        <View className='flex-1'>
          <Text className='mb-1.5 text-xs font-medium text-gray-700'>
            Sampai Tanggal
          </Text>

          <TouchableOpacity
            className='h-11 flex-row items-center justify-between px-3 bg-white rounded-lg border border-gray-200'
            onPress={() => setShowEndPicker(true)}
          >
            <Text
              className={`text-[13px] ${
                endDate ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {formatDate(endDate)}
            </Text>

            <Ionicons name='calendar-outline' size={18} color='#6b7280' />
          </TouchableOpacity>
        </View>
      </View>

      {/* RESET */}
      {(searchQuery || startDate || endDate) && (
        <TouchableOpacity
          className='self-end flex-row items-center gap-1.5 px-3 py-2 bg-white rounded-lg border border-gray-300'
          onPress={() => {
            setSearchQuery("")
            setStartDate(null)
            setEndDate(null)
          }}
        >
          <Ionicons name='refresh-outline' size={16} color='#374151' />

          <Text className='text-xs font-medium text-gray-700'>
            Reset Filter
          </Text>
        </TouchableOpacity>
      )}

      {/* DATE PICKER - START */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode='date'
          display='default'
          onChange={(event, selectedDate) => {
            setShowStartPicker(false)

            if (selectedDate) {
              setStartDate(selectedDate)
            }
          }}
        />
      )}

      {/* DATE PICKER - END */}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode='date'
          display='default'
          onChange={(event, selectedDate) => {
            setShowEndPicker(false)

            if (selectedDate) {
              setEndDate(selectedDate)
            }
          }}
        />
      )}
    </View>
  )

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  return (
    <View className='flex-1 bg-gray-50'>
      {renderFilterBar()}

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 20,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className='items-center p-10'>
            <Ionicons
              name='checkmark-done-circle-outline'
              size={48}
              color='#d1d5db'
            />

            <Text className='mt-3 text-sm text-gray-500'>
              {searchQuery
                ? "Tidak ada hasil pencarian"
                : "Belum ada order selesai"}
            </Text>

            <Text className='mt-1 text-xs text-gray-400'>
              Order yang sudah completed akan muncul di sini
            </Text>
          </View>
        }
      />
    </View>
  )
}
