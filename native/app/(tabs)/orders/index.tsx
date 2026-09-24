import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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
        style={styles.card}
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
        <View style={styles.cardHeader}>
          <View style={styles.orderCodeContainer}>
            <Text style={styles.orderCode}>{item.orderCode}</Text>

            <Text style={styles.checkInTime}>
              {new Date(item.createdAt).toLocaleDateString("id-ID")}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColor.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: statusColor.text,
                },
              ]}
            >
              {item.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.cardContent}>
          {/* CUSTOMER */}
          <View style={styles.row}>
            <Ionicons name='person-outline' size={16} color='#6b7280' />

            <Text style={styles.cardText} numberOfLines={1}>
              {item.customer?.name || "-"}
            </Text>
          </View>

          {/* VEHICLE */}
          <View style={styles.row}>
            <Ionicons name='car-outline' size={16} color='#6b7280' />

            <Text style={styles.cardText}>
              {item.vehicle?.plateNumber || "-"}
            </Text>
          </View>

          {/* SERVICE */}
          <View style={styles.row}>
            <Ionicons name='list-outline' size={16} color='#6b7280' />

            <Text style={styles.cardText}>
              {item.orderItems.length} service
              {item.orderItems.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.cardFooter}>
          <Text style={styles.totalPrice}>
            Rp {item.total.toLocaleString("id-ID")}
          </Text>

          <View
            style={[
              styles.paymentBadge,
              {
                backgroundColor: paymentBadge.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.paymentText,
                {
                  color: paymentBadge.text,
                },
              ]}
            >
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.cardActions}>
          {/* DETAIL */}
          <TouchableOpacity
            style={styles.actionButton}
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

            <Text style={styles.actionButtonText}>Detail</Text>
          </TouchableOpacity>

          {/* EDIT + DELETE */}
          {item.status === "WAITING" && (
            <>
              {/* EDIT */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: "#eff6ff",
                  },
                ]}
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

                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: "#2563eb",
                    },
                  ]}
                >
                  Edit
                </Text>
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: "#fef2f2",
                  },
                ]}
                onPress={() => handleDeleteOrder(item)}
              >
                <Ionicons name='trash-outline' size={16} color='#ef4444' />

                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: "#ef4444",
                    },
                  ]}
                >
                  Hapus
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  // SEARCH + FILTER
  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name='search' size={18} color='#9ca3af' />

        <TextInput
          style={styles.searchInput}
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
      <View style={styles.dateFilterRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Ionicons name='calendar-outline' size={18} color='#6b7280' />

          <Text style={styles.dateButtonText}>
            {startDate
              ? startDate.toLocaleDateString("id-ID")
              : "Tanggal mulai"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dateSeparator}>-</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Ionicons name='calendar-outline' size={18} color='#6b7280' />

          <Text style={styles.dateButtonText}>
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
      <View style={styles.filterRow}>
        {(["ALL", "WAITING", "IN_PROGRESS", "COMPLETED"] as StatusFilter[]).map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === status && styles.filterButtonTextActive,
                ]}
              >
                {status === "ALL" ? "Semua" : status.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>
    </View>
  )

  // LOADING
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  {
    showStartPicker && (
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
    )
  }

  {
    showEndPicker && (
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
    )
  }

  return (
    <View style={styles.container}>
      {renderFilterBar()}

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name='clipboard-outline' size={48} color='#d1d5db' />

            <Text style={styles.emptyText}>
              {searchQuery || statusFilter !== "ALL"
                ? "Tidak ada order sesuai filter"
                : "Belum ada order"}
            </Text>

            {!searchQuery && statusFilter === "ALL" && (
              <Text style={styles.emptySubtext}>
                Tekan tombol + untuk membuat order baru
              </Text>
            )}
          </View>
        }
      />

      {/* ADD ORDER */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/orders/create")}
      >
        <Ionicons name='add' size={24} color='#fff' />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  filterBar: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },

  dateFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  dateButtonText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
  },

  dateSeparator: {
    fontSize: 14,
    color: "#9ca3af",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },

  filterButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  filterButtonText: {
    fontSize: 12,
    color: "#6b7280",
  },

  filterButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  list: {
    padding: 16,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  orderCodeContainer: {
    gap: 4,
  },

  orderCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "monospace",
  },

  checkInTime: {
    fontSize: 12,
    color: "#9ca3af",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  cardContent: {
    gap: 8,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  cardText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 12,
  },

  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  paymentText: {
    fontSize: 12,
    fontWeight: "600",
  },

  cardActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f9fafb",
  },

  actionButtonText: {
    fontSize: 12,
    color: "#374151",
  },

  empty: {
    padding: 40,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 12,
  },

  emptySubtext: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
})
