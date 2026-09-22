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
      { text: "Batal", style: "cancel" },
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

  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/vehicles/[id]",
          params: {
            id: item.id.toString(),
          },
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.plateContainer}>
          <Text style={styles.plateNumber}>{item.plateNumber}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.vehicleName}>
            {item.brand} {item.model}
          </Text>
          <Text style={styles.customerName}>
            {getCustomerName(item.customerId)}
          </Text>
        </View>
        <Ionicons name='chevron-forward' size={20} color='#9ca3af' />
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.editButton}
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
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name='trash-outline' size={16} color='#ef4444' />
          <Text style={styles.deleteButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
      <View style={styles.searchContainer}>
        <Ionicons name='search' size={20} color='#9ca3af' />
        <TextInput
          style={styles.searchInput}
          placeholder='Cari plat nomor atau merek...'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicleCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name='car-outline' size={48} color='#d1d5db' />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Tidak ada hasil pencarian"
                : "Belum ada kendaraan"}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/vehicles/new")}
      >
        <Ionicons name='add' size={24} color='#fff' />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  list: { padding: 16, paddingBottom: 100 },
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
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  plateContainer: {
    backgroundColor: "#fef08a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  plateNumber: { fontSize: 12, fontWeight: "700", color: "#78350f" },
  cardInfo: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  customerName: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  editButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  editButtonText: { color: "#2563eb", fontSize: 14 },
  deleteButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  deleteButtonText: { color: "#ef4444", fontSize: 14 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#6b7280", marginTop: 12 },
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
})
