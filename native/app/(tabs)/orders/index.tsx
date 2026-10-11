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
import { Order } from "../../../types/order"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"

type StatusFilter = "ALL" | "WAITING" | "IN_PROGRESS" | "COMPLETED"

export default function OrderScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter, startDate, endDate])

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders")

      setOrders(response.data.data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filterOrders = () => {
    let result = orders

    // FILTER STATUS
    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter)
    }

    // FILTER TANGGAL MULAI
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)

      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= start
      })
    }

    // FILTER TANGGAL SELESAI
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate <= end
      })
    }

    // SEARCH
    if (searchQuery) {
      const query = searchQuery.toLowerCase()

      result = result.filter(
        (order) =>
          order.customer?.name?.toLowerCase().includes(query) ||
          order.vehicle?.plateNumber?.toLowerCase().includes(query) ||
          order.orderCode?.toLowerCase().includes(query),
      )
    }

    setFilteredOrders(result)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  const handleDeleteOrder = async (order: Order) => {
    Alert.alert("Konfirmasi Hapus", `Hapus order ${order.orderCode}?`, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/orders/${order.id}`)

            fetchOrders()
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.response?.data?.message || "Gagal menghapus order",
            )
          }
        },
      },
    ])
  }

  // WARNA STATUS ORDER
  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return {
          bg: "#fef3c7",
          text: "#92400e",
        }

      case "IN_PROGRESS":
        return {
          bg: "#dbeafe",
          text: "#1d4ed8",
        }

      case "COMPLETED":
        return {
          bg: "#d1fae5",
          text: "#065f46",
        }

      default:
        return {
          bg: "#e5e7eb",
          text: "#374151",
        }
    }
  }

  // WARNA STATUS PEMBAYARAN
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
    const statusColor = getStatusColor(item.status)
    const paymentBadge = getPaymentBadge(item.paymentStatus)

    return (
      <TouchableOpacity
        className='p-4 mb-3 bg-white rounded-xl'
        onPress={() =>
          router.push({
            pathname: "/(tabs)/orders/[id]",
            params: {
              id: item.id.toString(),
            },
          })
        }
      >
        {/* HEADER */}
        <View className='flex-row items-start justify-between mb-3'>
          <View className='gap-1'>
            <Text className='text-base font-bold text-gray-900'>
              {item.orderCode}
            </Text>

            <Text className='text-xs text-gray-400'>
              {new Date(item.createdAt).toLocaleDateString("id-ID")}
            </Text>
          </View>

          <View
            className='px-2.5 py-1 rounded-xl'
            style={{
              backgroundColor: statusColor.bg,
            }}
          >
            <Text
              className='text-[11px] font-semibold uppercase'
              style={{
                color: statusColor.text,
              }}
            >
              {item.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        {/* CONTENT */}
        <View className='gap-2 mb-3'>
          {/* CUSTOMER */}
          <View className='flex-row items-center gap-2'>
            <Ionicons name='person-outline' size={16} color='#6b7280' />

            <Text className='flex-1 text-sm text-gray-700' numberOfLines={1}>
              {item.customer?.name || "-"}
            </Text>
          </View>

          {/* VEHICLE */}
          <View className='flex-row items-center gap-2'>
            <Ionicons name='car-outline' size={16} color='#6b7280' />

            <Text className='flex-1 text-sm text-gray-700'>
              {item.vehicle?.plateNumber || "-"}
            </Text>
          </View>

          {/* SERVICE */}
          <View className='flex-row items-center gap-2'>
            <Ionicons name='list-outline' size={16} color='#6b7280' />

            <Text className='flex-1 text-sm text-gray-700'>
              {item.orderItems.length} service
              {item.orderItems.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View className='flex-row items-center justify-between pt-3 mb-3 border-t border-gray-200'>
          <Text className='text-lg font-bold text-gray-900'>
            Rp {item.total.toLocaleString("id-ID")}
          </Text>

          <View
            className='px-2 py-1 rounded-lg'
            style={{
              backgroundColor: paymentBadge.bg,
            }}
          >
            <Text
              className='text-xs font-semibold'
              style={{
                color: paymentBadge.text,
              }}
            >
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View className='flex-row gap-2 pt-2 border-t border-gray-100'>
          {/* DETAIL */}
          <TouchableOpacity
            className='flex-row items-center gap-1 px-3 py-1.5 rounded-md bg-gray-50'
            onPress={() =>
              router.push({
                pathname: "/(tabs)/orders/[id]",
                params: {
                  id: item.id.toString(),
                },
              })
            }
          >
            <Ionicons name='eye-outline' size={16} color='#2563eb' />

            <Text className='text-xs text-gray-700'>Detail</Text>
          </TouchableOpacity>

          {/* EDIT + DELETE */}
          {item.status === "WAITING" && (
            <>
              {/* EDIT */}
              <TouchableOpacity
                className='flex-row items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50'
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/orders/[id]",
                    params: {
                      id: item.id.toString(),
                    },
                  })
                }
              >
                <Ionicons name='create-outline' size={16} color='#2563eb' />

                <Text className='text-xs text-blue-600'>Edit</Text>
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                className='flex-row items-center gap-1 px-3 py-1.5 rounded-md bg-red-50'
                onPress={() => handleDeleteOrder(item)}
              >
                <Ionicons name='trash-outline' size={16} color='#ef4444' />

                <Text className='text-xs text-red-500'>Hapus</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  // SEARCH + FILTER
  const renderFilterBar = () => (
    <View className='gap-3 px-4 pt-2 pb-3'>
      {/* SEARCH */}
      <View className='flex-row items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200'>
        <Ionicons name='search' size={18} color='#9ca3af' />

        <TextInput
          className='flex-1 text-sm text-gray-900'
          placeholder='Cari customer, plat, atau kode...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor='#9ca3af'
        />

        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name='close-circle' size={18} color='#9ca3af' />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* DATE FILTER */}
      <View className='flex-row items-center gap-2'>
        <TouchableOpacity
          className='flex-1 flex-row items-center gap-2 px-3 py-2.5 bg-white rounded-lg border border-gray-200'
          onPress={() => setShowStartPicker(true)}
        >
          <Ionicons name='calendar-outline' size={18} color='#6b7280' />

          <Text className='flex-1 text-[13px] text-gray-700'>
            {startDate
              ? startDate.toLocaleDateString("id-ID")
              : "Tanggal mulai"}
          </Text>
        </TouchableOpacity>

        <Text className='text-sm text-gray-400'>-</Text>

        <TouchableOpacity
          className='flex-1 flex-row items-center gap-2 px-3 py-2.5 bg-white rounded-lg border border-gray-200'
          onPress={() => setShowEndPicker(true)}
        >
          <Ionicons name='calendar-outline' size={18} color='#6b7280' />

          <Text className='flex-1 text-[13px] text-gray-700'>
            {endDate ? endDate.toLocaleDateString("id-ID") : "Tanggal selesai"}
          </Text>
        </TouchableOpacity>

        {(startDate || endDate) && (
          <TouchableOpacity
            onPress={() => {
              setStartDate(null)
              setEndDate(null)
            }}
          >
            <Ionicons name='close-circle' size={20} color='#ef4444' />
          </TouchableOpacity>
        )}
      </View>

      {/* STATUS FILTER */}
      <View className='flex-row flex-wrap gap-2'>
        {(["ALL", "WAITING", "IN_PROGRESS", "COMPLETED"] as StatusFilter[]).map(
          (status) => {
            const isActive = statusFilter === status

            return (
              <TouchableOpacity
                key={status}
                className={`px-3 py-1.5 rounded-2xl border ${
                  isActive
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-200"
                }`}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  className={`text-xs ${
                    isActive ? "font-semibold text-white" : "text-gray-500"
                  }`}
                >
                  {status === "ALL" ? "Semua" : status.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            )
          },
        )}
      </View>
    </View>
  )

  // LOADING
  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
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
          paddingTop: 4,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className='items-center p-10'>
            <Ionicons name='clipboard-outline' size={48} color='#d1d5db' />

            <Text className='mt-3 text-sm text-gray-500'>
              {searchQuery || statusFilter !== "ALL"
                ? "Tidak ada order sesuai filter"
                : "Belum ada order"}
            </Text>

            {!searchQuery && statusFilter === "ALL" && (
              <Text className='mt-1 text-xs text-gray-400'>
                Tekan tombol + untuk membuat order baru
              </Text>
            )}
          </View>
        }
      />

      {/* ADD ORDER */}
      <TouchableOpacity
        className='absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center'
        onPress={() => router.push("/(tabs)/orders/create")}
      >
        <Ionicons name='add' size={24} color='#fff' />
      </TouchableOpacity>

      {/* START DATE PICKER */}
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

      {/* END DATE PICKER */}
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
}
