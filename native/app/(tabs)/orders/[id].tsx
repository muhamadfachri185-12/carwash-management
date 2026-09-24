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
import { useCallback } from "react"

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
  const [successMessage, setSuccessMessage] = useState("")

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
              setTimeout(() => setSuccessMessage(""), 2000)
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
      paymentMethod === "CASH"
        ? parseFloat(receivedAmount)
        : Number(order.total)

    if (paymentMethod === "CASH" && amount < Number(order.total)) {
      Alert.alert("Error", "Uang yang diterima kurang dari total")
      return
    }

    setActionLoading(true)

    try {
      console.log("PAYMENT PAYLOAD:", {
        amount,
        method: paymentMethod,
      })

      await api.post(`/orders/${order.id}/payment`, {
        amount,
        method: paymentMethod,
      })

      setSuccessMessage("Pembayaran berhasil dicatat")
      setShowPaymentForm(false)
      setPaymentMethod("")
      setReceivedAmount("")

      await fetchOrder()

      setTimeout(() => setSuccessMessage(""), 2000)
    } catch (error: any) {
      console.log("PAYMENT ERROR:", error.response?.data)

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          JSON.stringify(error.response?.data) ||
          "Gagal memproses pembayaran",
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

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Order tidak ditemukan</Text>
      </View>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return { bg: "#fef08a", text: "#713f12" }
      case "IN_PROGRESS":
        return { bg: "#bfdbfe", text: "#1e40af" }
      case "COMPLETED":
        return { bg: "#a7f3d0", text: "#065f46" }
      default:
        return { bg: "#e5e7eb", text: "#374151" }
    }
  }

  const statusColor = getStatusColor(order.status)
  const changeAmount =
    paymentMethod === "CASH" && receivedAmount
      ? parseFloat(receivedAmount) - order.total
      : 0

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={24} color='#374151' />
        </TouchableOpacity>
        <Text style={styles.title}>Detail Order</Text>
        <View style={{ width: 24 }} />
      </View>

      {successMessage && (
        <View style={styles.successBanner}>
          <Ionicons name='checkmark-circle' size={20} color='#10b981' />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.orderHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderCode}>{order.orderCode}</Text>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor.bg },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColor.text }]}>
                  {order.status.replace("_", " ")}
                </Text>
              </View>
            </View>

            {order.status === "WAITING" && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/orders/create",
                    params: {
                      id: order.id.toString(),
                    },
                  })
                }
              >
                <Ionicons name='create-outline' size={24} color='#2563eb' />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer & Kendaraan</Text>
          <View style={styles.infoRow}>
            <Ionicons name='person' size={18} color='#6b7280' />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>{order.customer.name}</Text>
              <Text style={styles.infoSubtext}>{order.customer.phone}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='car' size={18} color='#6b7280' />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Kendaraan</Text>
              <Text style={styles.infoValue}>{order.vehicle.plateNumber}</Text>
              <Text style={styles.infoSubtext}>
                {order.vehicle.brand} {order.vehicle.model}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Items</Text>
          {order.orderItems.map((item, index) => (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceItemInfo}>
                <Text style={styles.serviceItemName}>{item.service.name}</Text>
                <Text style={styles.serviceItemQty}>× {item.quantity}</Text>
              </View>
              <Text style={styles.serviceItemPrice}>
                Rp {item.subtotal.toLocaleString("id-ID")}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rp {order.total.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        {order.status === "WAITING" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#2563eb" }]}
            onPress={() => handleUpdateStatus("IN_PROGRESS")}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <>
                <Ionicons name='play' size={20} color='#fff' />
                <Text style={styles.actionButtonText}>Mulai Pengerjaan</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {order.status === "IN_PROGRESS" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#10b981" }]}
            onPress={() => handleUpdateStatus("COMPLETED")}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <>
                <Ionicons name='checkmark-done' size={20} color='#fff' />
                <Text style={styles.actionButtonText}>
                  Selesaikan Pengerjaan
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {order.status === "COMPLETED" && order.paymentStatus === "UNPAID" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pembayaran</Text>

            {!showPaymentForm ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#10b981" }]}
                onPress={() => setShowPaymentForm(true)}
              >
                <Ionicons name='cash' size={20} color='#fff' />
                <Text style={styles.actionButtonText}>Catat Pembayaran</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.paymentForm}>
                <Text style={styles.label}>Metode Pembayaran</Text>
                <View style={styles.paymentMethods}>
                  {(["CASH", "TRANSFER", "QRIS"] as const).map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentMethodButton,
                        paymentMethod === method && styles.paymentMethodActive,
                      ]}
                      onPress={() => setPaymentMethod(method)}
                    >
                      <Text
                        style={[
                          styles.paymentMethodText,
                          paymentMethod === method &&
                            styles.paymentMethodTextActive,
                        ]}
                      >
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {paymentMethod === "CASH" && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Uang Diterima</Text>
                    <TextInput
                      style={styles.input}
                      placeholder='Masukkan jumlah'
                      value={receivedAmount}
                      onChangeText={setReceivedAmount}
                      keyboardType='numeric'
                    />
                    {changeAmount >= 0 && receivedAmount && (
                      <Text style={styles.changeText}>
                        Kembalian: Rp {changeAmount.toLocaleString("id-ID")}
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.paymentActions}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => {
                      setShowPaymentForm(false)
                      setPaymentMethod("")
                      setReceivedAmount("")
                    }}
                  >
                    <Text style={styles.buttonSecondaryText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonPrimary,
                      (!paymentMethod ||
                        (paymentMethod === "CASH" && changeAmount < 0)) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handlePayment}
                    disabled={
                      actionLoading ||
                      !paymentMethod ||
                      (paymentMethod === "CASH" && changeAmount < 0)
                    }
                  >
                    {actionLoading ? (
                      <ActivityIndicator color='#fff' />
                    ) : (
                      <Text style={styles.buttonPrimaryText}>Konfirmasi</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {order.payment && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informasi Pembayaran</Text>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentInfoLabel}>Metode</Text>
              <Text style={styles.paymentInfoValue}>
                {order.payment.method}
              </Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentInfoLabel}>Jumlah</Text>
              <Text style={styles.paymentInfoValue}>
                Rp {order.payment.amount.toLocaleString("id-ID")}
              </Text>
            </View>
            {order.payment.method === "CASH" && (
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentInfoLabel}>Kembalian</Text>
                <Text style={[styles.paymentInfoValue, { color: "#10b981" }]}>
                  Rp{" "}
                  {(order.payment.amount - order.total).toLocaleString("id-ID")}
                </Text>
              </View>
            )}
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentInfoLabel}>Waktu</Text>
              <Text style={styles.paymentInfoValue}>
                {new Date(order.payment.paidAt).toLocaleString("id-ID")}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  // Add styles untuk success banner:
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 16,
    padding: 12,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  successText: { color: "#065f46", fontSize: 14, fontWeight: "500" },
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
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
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
