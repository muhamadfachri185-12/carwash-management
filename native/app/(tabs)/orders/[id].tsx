import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
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
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  if (!order) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <Text className='text-base text-gray-500'>Order tidak ditemukan</Text>
      </View>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return {
          bg: "#fef08a",
          text: "#713f12",
        }

      case "IN_PROGRESS":
        return {
          bg: "#bfdbfe",
          text: "#1e40af",
        }

      case "COMPLETED":
        return {
          bg: "#a7f3d0",
          text: "#065f46",
        }

      default:
        return {
          bg: "#e5e7eb",
          text: "#374151",
        }
    }
  }

  const statusColor = getStatusColor(order.status)

  const changeAmount =
    paymentMethod === "CASH" && receivedAmount
      ? parseFloat(receivedAmount) - order.total
      : 0

  return (
    <View className='flex-1 bg-gray-50'>
      {/* HEADER */}
      <View className='flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200'>
        <TouchableOpacity
          onPress={() => router.back()}
          className='w-10 h-10 items-center justify-center'
        >
          <Ionicons name='arrow-back' size={24} color='#374151' />
        </TouchableOpacity>

        <Text className='text-lg font-semibold text-gray-900'>
          Detail Order
        </Text>

        <View className='w-10 h-10' />
      </View>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <View className='flex-row items-center gap-3 mx-4 mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200'>
          <Ionicons name='checkmark-circle' size={20} color='#10b981' />

          <Text className='text-sm font-medium text-emerald-800'>
            {successMessage}
          </Text>
        </View>
      )}

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <View className='px-4 pt-4 pb-6'>
          {/* ORDER INFO */}
          <View className='p-4 mb-3 bg-white rounded-xl border border-gray-200'>
            <View className='flex-row items-center'>
              <View className='flex-1'>
                <Text className='mb-2 text-xl font-bold text-gray-900'>
                  {order.orderCode}
                </Text>

                <View
                  className='self-start px-3 py-1.5 rounded-xl'
                  style={{
                    backgroundColor: statusColor.bg,
                  }}
                >
                  <Text
                    className='text-xs font-semibold uppercase'
                    style={{
                      color: statusColor.text,
                    }}
                  >
                    {order.status.replace("_", " ")}
                  </Text>
                </View>
              </View>

              {order.status === "WAITING" && (
                <TouchableOpacity
                  className='w-11 h-11 rounded-full bg-blue-50 items-center justify-center'
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/orders/create",
                      params: {
                        id: order.id.toString(),
                      },
                    })
                  }
                >
                  <Ionicons name='create-outline' size={22} color='#2563eb' />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* CUSTOMER & VEHICLE */}
          <View className='p-4 mb-3 bg-white rounded-xl border border-gray-200'>
            <Text className='mb-4 text-base font-semibold text-gray-900'>
              Customer & Kendaraan
            </Text>

            {/* CUSTOMER */}
            <View className='flex-row gap-3 mb-4'>
              <View className='w-9 h-9 rounded-full bg-gray-100 items-center justify-center'>
                <Ionicons name='person' size={18} color='#6b7280' />
              </View>

              <View className='flex-1'>
                <Text className='mb-1 text-xs text-gray-500'>Customer</Text>

                <Text className='text-[15px] font-semibold text-gray-900'>
                  {order.customer.name}
                </Text>

                <Text className='mt-0.5 text-[13px] text-gray-500'>
                  {order.customer.phone}
                </Text>
              </View>
            </View>

            {/* VEHICLE */}
            <View className='flex-row gap-3'>
              <View className='w-9 h-9 rounded-full bg-gray-100 items-center justify-center'>
                <Ionicons name='car' size={18} color='#6b7280' />
              </View>

              <View className='flex-1'>
                <Text className='mb-1 text-xs text-gray-500'>Kendaraan</Text>

                <Text className='text-[15px] font-semibold text-gray-900'>
                  {order.vehicle.plateNumber}
                </Text>

                <Text className='mt-0.5 text-[13px] text-gray-500'>
                  {order.vehicle.brand} {order.vehicle.model}
                </Text>
              </View>
            </View>
          </View>

          {/* SERVICE ITEMS */}
          <View className='p-4 mb-3 bg-white rounded-xl border border-gray-200'>
            <Text className='mb-3 text-base font-semibold text-gray-900'>
              Service Items
            </Text>

            {order.orderItems.map((item, index) => (
              <View
                key={index}
                className='flex-row items-center justify-between py-3 border-b border-gray-100'
              >
                <View className='flex-1 flex-row items-center gap-2'>
                  <Text className='text-sm text-gray-700'>
                    {item.service.name}
                  </Text>

                  <Text className='text-sm text-gray-500'>
                    × {item.quantity}
                  </Text>
                </View>

                <Text className='text-sm font-semibold text-gray-900'>
                  Rp {item.subtotal.toLocaleString("id-ID")}
                </Text>
              </View>
            ))}

            <View className='flex-row justify-between mt-2 pt-3 border-t-2 border-gray-200'>
              <Text className='text-base font-semibold text-gray-500'>
                Total
              </Text>

              <Text className='text-lg font-bold text-gray-900'>
                Rp {order.total.toLocaleString("id-ID")}
              </Text>
            </View>
          </View>

          {/* START ORDER */}
          {order.status === "WAITING" && (
            <TouchableOpacity
              className={`flex-row h-12 mb-3 rounded-lg items-center justify-center gap-2 ${
                actionLoading ? "bg-blue-400" : "bg-blue-600"
              }`}
              onPress={() => handleUpdateStatus("IN_PROGRESS")}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <>
                  <Ionicons name='play' size={20} color='#fff' />

                  <Text className='text-base font-semibold text-white'>
                    Mulai Pengerjaan
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* COMPLETE ORDER */}
          {order.status === "IN_PROGRESS" && (
            <TouchableOpacity
              className={`flex-row h-12 mb-3 rounded-lg items-center justify-center gap-2 ${
                actionLoading ? "bg-emerald-400" : "bg-emerald-600"
              }`}
              onPress={() => handleUpdateStatus("COMPLETED")}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <>
                  <Ionicons name='checkmark-done' size={20} color='#fff' />

                  <Text className='text-base font-semibold text-white'>
                    Selesaikan Pengerjaan
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* PAYMENT */}
          {order.status === "COMPLETED" && order.paymentStatus === "UNPAID" && (
            <View className='p-4 mb-3 bg-white rounded-xl border border-gray-200'>
              <Text className='mb-3 text-base font-semibold text-gray-900'>
                Pembayaran
              </Text>

              {!showPaymentForm ? (
                <TouchableOpacity
                  className='flex-row h-12 rounded-lg items-center justify-center gap-2 bg-emerald-600'
                  onPress={() => setShowPaymentForm(true)}
                >
                  <Ionicons name='cash' size={20} color='#fff' />

                  <Text className='text-base font-semibold text-white'>
                    Catat Pembayaran
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className='gap-4'>
                  {/* PAYMENT METHOD */}
                  <View>
                    <Text className='mb-2 text-sm font-medium text-gray-700'>
                      Metode Pembayaran
                    </Text>

                    <View className='flex-row gap-2'>
                      {(["CASH", "TRANSFER", "QRIS"] as const).map((method) => (
                        <TouchableOpacity
                          key={method}
                          className={`flex-1 h-12 rounded-lg border items-center justify-center ${
                            paymentMethod === method
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300"
                          }`}
                          onPress={() => setPaymentMethod(method)}
                        >
                          <Text
                            className={`text-sm ${
                              paymentMethod === method
                                ? "font-semibold text-white"
                                : "text-gray-700"
                            }`}
                          >
                            {method}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* CASH */}
                  {paymentMethod === "CASH" && (
                    <View className='gap-2'>
                      <Text className='text-sm font-medium text-gray-700'>
                        Uang Diterima
                      </Text>

                      <TextInput
                        className='h-12 px-4 text-base text-gray-900 bg-white rounded-lg border border-gray-300'
                        placeholder='Masukkan jumlah'
                        placeholderTextColor='#9ca3af'
                        value={receivedAmount}
                        onChangeText={setReceivedAmount}
                        keyboardType='numeric'
                      />

                      {changeAmount >= 0 && receivedAmount && (
                        <Text className='text-sm font-semibold text-emerald-600'>
                          Kembalian: Rp {changeAmount.toLocaleString("id-ID")}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* PAYMENT ACTIONS */}
                  <View className='flex-row gap-3'>
                    <TouchableOpacity
                      className='flex-1 h-12 rounded-lg items-center justify-center bg-gray-100'
                      onPress={() => {
                        setShowPaymentForm(false)
                        setPaymentMethod("")
                        setReceivedAmount("")
                      }}
                    >
                      <Text className='text-base font-semibold text-gray-700'>
                        Batal
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={`flex-1 h-12 rounded-lg items-center justify-center ${
                        !paymentMethod ||
                        (paymentMethod === "CASH" && changeAmount < 0)
                          ? "bg-blue-300"
                          : "bg-blue-600"
                      }`}
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
                        <Text className='text-base font-semibold text-white'>
                          Konfirmasi
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* PAYMENT INFORMATION */}
          {order.payment && (
            <View className='p-4 mb-3 bg-white rounded-xl border border-gray-200'>
              <Text className='mb-3 text-base font-semibold text-gray-900'>
                Informasi Pembayaran
              </Text>

              <View className='flex-row justify-between py-3 border-b border-gray-100'>
                <Text className='text-sm text-gray-500'>Metode</Text>

                <Text className='text-sm font-semibold text-gray-900'>
                  {order.payment.method}
                </Text>
              </View>

              <View className='flex-row justify-between py-3 border-b border-gray-100'>
                <Text className='text-sm text-gray-500'>Jumlah</Text>

                <Text className='text-sm font-semibold text-gray-900'>
                  Rp {order.payment.amount.toLocaleString("id-ID")}
                </Text>
              </View>

              {order.payment.method === "CASH" && (
                <View className='flex-row justify-between py-3 border-b border-gray-100'>
                  <Text className='text-sm text-gray-500'>Kembalian</Text>

                  <Text className='text-sm font-semibold text-emerald-600'>
                    Rp{" "}
                    {(order.payment.amount - order.total).toLocaleString(
                      "id-ID",
                    )}
                  </Text>
                </View>
              )}

              <View className='flex-row justify-between py-3'>
                <Text className='text-sm text-gray-500'>Waktu</Text>

                <Text className='flex-1 ml-4 text-sm font-semibold text-gray-900 text-right'>
                  {new Date(order.payment.paidAt).toLocaleString("id-ID")}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
