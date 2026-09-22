import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import api from "../../../lib/api"
import { Order } from "../../../types/order"
import { Ionicons } from "@expo/vector-icons"

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TRANSFER" | "QRIS" | ""
  >("")
  const [receivedAmount, setReceivedAmount] = useState("")

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data.data)
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat order",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: "IN_PROGRESS" | "COMPLETED") => {
    if (!order) return

    Alert.alert(
      "Konfirmasi",
      `Ubah status order menjadi ${newStatus.replace("_", " ")}?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Ya",
          onPress: async () => {
            setActionLoading(true)

            try {
              await api.patch(`/orders/${order.id}/status`, {
                status: newStatus,
              })

              await fetchOrder()
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Gagal update status",
              )
            } finally {
              setActionLoading(false)
            }
          },
        },
      ],
    )
  }

  const handlePayment = async () => {
    if (!order || !paymentMethod) return

    const amount =
      paymentMethod === "CASH" ? parseFloat(receivedAmount) : order.total
    if (paymentMethod === "CASH" && amount < order.total) {
      Alert.alert("Error", "Uang yang diterima kurang dari total")
      return
    }
    setActionLoading(true)
    try {
      await api.post(`/orders/${order.id}/payment`, {
        amount,
        method: paymentMethod,
      })
      ;(Alert.alert("Sukses", "Pembayaran berhasil dicatat"),
        setShowPaymentForm(false))
      setPaymentMethod("")
      setReceivedAmount("")
      await fetchOrder()
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memproses pembayaran",
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#111827" },
  content: { flex: 1, padding: 16 },
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
  orderCode: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: "600", color: "#111827" },
  infoSubtext: { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  serviceItemInfo: { flexDirection: "row", gap: 8, flex: 1 },
  serviceItemName: { fontSize: 14, color: "#374151", flex: 1 },
  serviceItemQty: { fontSize: 14, color: "#6b7280" },
  serviceItemPrice: { fontSize: 14, fontWeight: "600", color: "#111827" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
  },
  totalLabel: { fontSize: 16, fontWeight: "600", color: "#6b7280" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#111827" },
  actionButton: {
    flexDirection: "row",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  paymentForm: { gap: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 },
  paymentMethods: { flexDirection: "row", gap: 8 },
  paymentMethodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  paymentMethodActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  paymentMethodText: { fontSize: 14, color: "#374151" },
  paymentMethodTextActive: { color: "#fff", fontWeight: "600" },
  field: { gap: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  changeText: { fontSize: 14, color: "#10b981", fontWeight: "600" },
  paymentActions: { flexDirection: "row", gap: 12 },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPrimary: { backgroundColor: "#2563eb" },
  buttonSecondary: { backgroundColor: "#f3f4f6" },
  buttonDisabled: { opacity: 0.5 },
  buttonPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  buttonSecondaryText: { color: "#374151", fontSize: 16, fontWeight: "600" },
  paymentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  paymentInfoLabel: { fontSize: 14, color: "#6b7280" },
  paymentInfoValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  errorText: { fontSize: 16, color: "#6b7280" },
})
