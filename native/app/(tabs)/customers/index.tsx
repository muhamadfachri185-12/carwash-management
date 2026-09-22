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
import { Customer } from "../../../types/order"
import { Ionicons } from "@expo/vector-icons"

export default function CustomerScreen() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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
            await api.delete(`/customers/${customer.id}`)

            fetchCustomers()
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.response?.data?.message || "Gagal menghapus customer",
            )
          }
        },
      },
    ])
  }

  const renderCustomerCard = ({ item }: { item: Customer }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tabs)/customers/${item.id}`)}
      >
        {/* BAGIAN ATAS CARD */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.customerName}>{item.name}</Text>

            <Text style={styles.customerPhone}>{item.phone}</Text>
          </View>

          <Ionicons name='chevron-forward' size={20} color='#9ca3af' />
        </View>

        {/* BAGIAN BAWAH CARD */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/(tabs)/customers/${item.id}`)}
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
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name='search' size={20} color='#9ca3af' />

        <TextInput
          style={styles.searchInput}
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
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name='people-outline' size={48} color='#d1d5db' />

            <Text style={styles.emptyText}>
              {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada customer"}
            </Text>
          </View>
        }
      />

      {/* BUTTON TAMBAH */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/customers/new")}
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  cardInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  customerPhone: { fontSize: 14, color: "#6b7280", marginTop: 2 },
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
