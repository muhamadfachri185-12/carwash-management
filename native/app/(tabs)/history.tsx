import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { useRouter } from "expo-router"
import api from "../../lib/api"
import { Order } from "../../types/order"
import { Ionicons } from "@expo/vector-icons"
import { TextInput } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

export default function HistyoryScreen() {
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
        return { bg: "#d1fae5", text: "#065f46" }
      case "UNPAID":
        return { bg: "#fee2e2", text: "#991b1b" }
      default:
        return { bg: "#e5e7eb", text: "#374151" }
    }
  }

  const renderOrderCard = ({ item }: { item: Order }) => {
    const paymentBadge = getPaymentBadge(item.paymentStatus)
    const completedDate = item.completedAt
      ? new Date(item.completedAt).toLocaleDateString("id-ID")
      : new Date(item.createdAt).toLocaleDateString("id-ID")

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tabs)/orders/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderCodeContainer}>
            <Text style={styles.orderCode}>{item.orderCode}</Text>
            <Text style={styles.completedDate}>{completedDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: "#a7f3d0" }]}>
            <Text style={[styles.statusText, { color: "#065f46" }]}>
              COMPLETED
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.row}>
            <Ionicons name='person-outline' size={16} color='#6b7280' />
            <Text style={styles.cardText} numberOfLines={1}>
              {item.customer?.name || "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name='car-outline' size={16} color='#6b7280' />
            <Text style={styles.cardText}>
              {item.vehicle?.plateNumber || "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name='list-outline' size={16} color='#6b7280' />
            <Text style={styles.cardText}>
              {item.orderItems.length} service
              {item.orderItems.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalPrice}>
            Rp {item.total.toLocaleString("id-ID")}
          </Text>
          <View
            style={[styles.paymentBadge, { backgroundColor: paymentBadge.bg }]}
          >
            <Text style={[styles.paymentText, { color: paymentBadge.text }]}>
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/(tabs)/orders/${item.id}`)}
          >
            <Ionicons name='eye-outline' size={16} color='#2563eb' />
            <Text style={styles.viewButtonText}>Lihat Detail</Text>
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
    <View style={styles.filterBar}>
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

      {/* FILTER TANGGAL */}
      <View style={styles.dateFilterRow}>
        {/* DARI TANGGAL */}
        <View style={styles.dateFilterItem}>
          <Text style={styles.dateLabel}>Dari Tanggal</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text
              style={[
                styles.dateButtonText,
                !startDate && styles.datePlaceholder,
              ]}
            >
              {formatDate(startDate)}
            </Text>

            <Ionicons name='calendar-outline' size={18} color='#6b7280' />
          </TouchableOpacity>
        </View>

        {/* SAMPAI TANGGAL */}
        <View style={styles.dateFilterItem}>
          <Text style={styles.dateLabel}>Sampai Tanggal</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text
              style={[
                styles.dateButtonText,
                !endDate && styles.datePlaceholder,
              ]}
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
          style={styles.resetButton}
          onPress={() => {
            setSearchQuery("")
            setStartDate(null)
            setEndDate(null)
          }}
        >
          <Ionicons name='refresh-outline' size={16} color='#374151' />

          <Text style={styles.resetButtonText}>Reset Filter</Text>
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
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
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
            <Ionicons
              name='checkmark-done-circle-outline'
              size={48}
              color='#d1d5db'
            />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Tidak ada hasil pencarian"
                : "Belum ada order selesai"}
            </Text>
            <Text style={styles.emptySubtext}>
              Order yang sudah completed akan muncul di sini
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterBar: { padding: 16, paddingTop: 8, gap: 12 },
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
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  list: { padding: 16, paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderCodeContainer: { gap: 4 },
  orderCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "monospace",
  },
  completedDate: { fontSize: 12, color: "#9ca3af" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  cardContent: { gap: 8, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardText: { fontSize: 14, color: "#374151", flex: 1 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 12,
  },
  dateFilterRow: {
    flexDirection: "row",
    gap: 12,
  },

  dateFilterItem: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "500",
  },

  dateButton: {
    height: 44,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateButtonText: {
    fontSize: 13,
    color: "#111827",
  },

  datePlaceholder: {
    color: "#9ca3af",
  },

  resetButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  resetButtonText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  totalPrice: { fontSize: 18, fontWeight: "700", color: "#111827" },
  paymentBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  paymentText: { fontSize: 12, fontWeight: "600" },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewButtonText: { fontSize: 12, color: "#2563eb" },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#6b7280", marginTop: 12 },
  emptySubtext: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
})
