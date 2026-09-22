import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native"
import { useRouter } from "expo-router"
import api from "../../../lib/api"
import { Customer, Vehicle, Service } from "../../../types/order"
import { Ionicons } from "@expo/vector-icons"

interface SelectedService {
  serviceId: number
  quantity: number
}

export default function CreateOrderScreen() {
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [services, setServices] = useState<Service[]>([])

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  )

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  )

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    [],
  )

  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [custRes, vehRes, servRes] = await Promise.all([
        api.get("/customers"),
        api.get("/vehicles"),
        api.get("/services"),
      ])

      setCustomers(custRes.data.customers)
      setVehicles(vehRes.data.vehicles)

      setServices(
        servRes.data.services.filter((service: Service) => service.isActive),
      )
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Error", "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  // Hanya tampilkan kendaraan milik customer yang dipilih
  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.customerId === selectedCustomerId,
  )

  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomerId(customerId)

    // Reset kendaraan ketika customer diganti
    setSelectedVehicleId(null)

    setShowCustomerDropdown(false)
  }

  const handleVehicleSelect = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId)
    setShowVehicleDropdown(false)
  }

  const handleServiceQuantityChange = (serviceId: number, delta: number) => {
    setSelectedServices((prev) => {
      const existing = prev.find((service) => service.serviceId === serviceId)

      // Kalau service belum dipilih
      if (!existing) {
        // Hanya tambah kalau tombol + ditekan
        if (delta > 0) {
          return [
            ...prev,
            {
              serviceId,
              quantity: 1,
            },
          ]
        }

        return prev
      }

      const newQuantity = existing.quantity + delta

      // Kalau quantity menjadi 0, hapus dari selectedServices
      if (newQuantity <= 0) {
        return prev.filter((service) => service.serviceId !== serviceId)
      }

      return prev.map((service) =>
        service.serviceId === serviceId
          ? {
              ...service,
              quantity: newQuantity,
            }
          : service,
      )
    })
  }

  const calculateTotal = () => {
    return selectedServices.reduce((sum, selected) => {
      const service = services.find(
        (service) => service.id === selected.serviceId,
      )

      return sum + (service ? Number(service.price) * selected.quantity : 0)
    }, 0)
  }

  const validateForm = () => {
    if (!selectedCustomerId) {
      setError("Pilih customer terlebih dahulu")
      return false
    }

    if (!selectedVehicleId) {
      setError("Pilih kendaraan terlebih dahulu")
      return false
    }

    if (selectedServices.length === 0) {
      setError("Pilih minimal 1 service")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSaving(true)
    setError("")

    try {
      await api.post("/orders", {
        customerId: selectedCustomerId,
        vehicleId: selectedVehicleId,
        items: selectedServices,
      })

      Alert.alert("Sukses", "Order berhasil dibuat", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error: any) {
      console.error("Error creating order:", error)

      setError(error.response?.data?.message || "Gagal membuat order")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  )

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  )

  const total = calculateTotal()

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={24} color='#374151' />
        </TouchableOpacity>

        <Text style={styles.title}>Buat Order Baru</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* ERROR */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* CUSTOMER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Pilih Customer</Text>

          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowCustomerDropdown(!showCustomerDropdown)}
          >
            <Text
              style={[
                styles.dropdownButtonText,
                !selectedCustomerId && styles.placeholderText,
              ]}
            >
              {selectedCustomer?.name || "Pilih Customer"}
            </Text>

            <Ionicons
              name={showCustomerDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color='#6b7280'
            />
          </TouchableOpacity>

          {showCustomerDropdown && (
            <View style={styles.dropdownList}>
              <FlatList
                data={customers}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleCustomerSelect(item.id)}
                  >
                    <Text style={styles.dropdownItemText}>{item.name}</Text>

                    <Text style={styles.dropdownItemSubtext}>{item.phone}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* VEHICLE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Pilih Kendaraan</Text>

          <TouchableOpacity
            style={[
              styles.dropdownButton,
              !selectedCustomerId && styles.dropdownDisabled,
            ]}
            onPress={() => {
              if (selectedCustomerId) {
                setShowVehicleDropdown(!showVehicleDropdown)
              }
            }}
            disabled={!selectedCustomerId}
          >
            <Text
              style={[
                styles.dropdownButtonText,
                !selectedVehicleId && styles.placeholderText,
              ]}
            >
              {selectedVehicle
                ? `${selectedVehicle.plateNumber} - ${selectedVehicle.brand} ${selectedVehicle.model}`
                : selectedCustomerId
                  ? "Pilih Kendaraan"
                  : "Pilih customer dulu"}
            </Text>

            <Ionicons
              name={showVehicleDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color='#6b7280'
            />
          </TouchableOpacity>

          {showVehicleDropdown && (
            <View style={styles.dropdownList}>
              {filteredVehicles.length === 0 ? (
                <View style={styles.emptyDropdown}>
                  <Text style={styles.emptyDropdownText}>
                    Customer belum memiliki kendaraan
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredVehicles}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleVehicleSelect(item.id)}
                    >
                      <Text style={styles.dropdownItemText}>
                        {item.plateNumber}
                      </Text>

                      <Text style={styles.dropdownItemSubtext}>
                        {item.brand} {item.model}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}
        </View>

        {/* SERVICES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Pilih Service</Text>

          {services.map((service) => {
            const selected = selectedServices.find(
              (item) => item.serviceId === service.id,
            )

            const quantity = selected?.quantity || 0

            return (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>

                  <Text style={styles.servicePrice}>
                    Rp {Number(service.price).toLocaleString("id-ID")}
                  </Text>

                  <Text style={styles.serviceDuration}>
                    {service.duration} menit
                  </Text>
                </View>

                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleServiceQuantityChange(service.id, -1)}
                  >
                    <Ionicons name='remove' size={20} color='#374151' />
                  </TouchableOpacity>

                  <Text style={styles.quantity}>{quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleServiceQuantityChange(service.id, 1)}
                  >
                    <Ionicons name='add' size={20} color='#374151' />
                  </TouchableOpacity>
                </View>

                {quantity > 0 && (
                  <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Subtotal:</Text>

                    <Text style={styles.subtotalValue}>
                      Rp{" "}
                      {(Number(service.price) * quantity).toLocaleString(
                        "id-ID",
                      )}
                    </Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Estimasi</Text>

          <Text style={styles.totalValue}>
            Rp {total.toLocaleString("id-ID")}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.submitButtonText}>Buat Order</Text>
          )}
        </TouchableOpacity>
      </View>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  content: {
    flex: 1,
    padding: 16,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },

  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  dropdownDisabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
  },

  dropdownButtonText: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },

  placeholderText: {
    color: "#9ca3af",
  },

  dropdownList: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "#fff",
    maxHeight: 200,
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },

  dropdownItemSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  emptyDropdown: {
    padding: 20,
    alignItems: "center",
  },

  emptyDropdownText: {
    fontSize: 13,
    color: "#9ca3af",
  },

  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  serviceInfo: {
    marginBottom: 8,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  servicePrice: {
    fontSize: 14,
    color: "#2563eb",
    marginTop: 4,
  },

  serviceDuration: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },

  quantity: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    minWidth: 30,
    textAlign: "center",
  },

  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  subtotalLabel: {
    fontSize: 13,
    color: "#6b7280",
  },

  subtotalValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  totalLabel: {
    fontSize: 16,
    color: "#6b7280",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  submitButton: {
    height: 48,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
})
