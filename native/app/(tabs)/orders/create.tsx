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
  TextInput,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import api from "../../../lib/api"
import { Customer, Vehicle, Service } from "../../../types/order"
import { Ionicons } from "@expo/vector-icons"

interface SelectedService {
  serviceId: number
  quantity: number
}

export default function CreateOrderScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  const isEdit = !!id

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

  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerPhone, setNewCustomerPhone] = useState("")
  const [newCustomerAddress, setNewCustomerAddress] = useState("")
  const [newVehiclePlate, setNewVehiclePlate] = useState("")
  const [newVehicleBrand, setNewVehicleBrand] = useState("")
  const [newVehicleModel, setNewVehicleModel] = useState("")

  const [savingCustomer, setSavingCustomer] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (id) {
      fetchOrderForEdit()
    }
  }, [id])

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

      // Kalau mode edit, ambil data order
      if (id) {
        const orderRes = await api.get(`/orders/${id}`)
        const order = orderRes.data.data

        setSelectedCustomerId(order.customerId)
        setSelectedVehicleId(order.vehicleId)

        setSelectedServices(
          order.orderItems.map((item: any) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Error", "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderForEdit = async () => {
    try {
      setLoading(true)

      const response = await api.get(`/orders/${id}`)
      const order = response.data.data

      // Customer
      setSelectedCustomerId(order.customerId)

      // Vehicle
      setSelectedVehicleId(order.vehicleId)

      // Service yang sudah dipilih
      setSelectedServices(
        order.orderItems.map((item: any) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
        })),
      )
    } catch (error: any) {
      console.error("Error fetching order:", error.response?.data)

      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat order",
      )
    } finally {
      setLoading(false)
    }
  }

  // Hanya tampilkan kendaraan milik customer yang dipilih
  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.customerId === selectedCustomerId,
  )

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      setError("Nama customer harus diisi")
      return
    }

    if (!newCustomerPhone.trim()) {
      setError("Nomor telepon harus diisi")
      return
    }

    setSavingCustomer(true)
    setError("")

    try {
      const response = await api.post("/customers", {
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        address: newCustomerAddress.trim(),
      })

      const newCustomer = response.data.customer

      // Tambahkan customer baru ke list
      setCustomers((prev) => [...prev, newCustomer])

      // Langsung pilih customer baru
      setSelectedCustomerId(newCustomer.id)

      // Reset form
      setNewCustomerName("")
      setNewCustomerPhone("")
      setNewCustomerAddress("")

      setShowNewCustomerForm(false)
      setShowCustomerDropdown(false)

      Alert.alert("Sukses", "Customer berhasil ditambahkan")
    } catch (error: any) {
      console.error("Create customer error:", error)

      setError(error.response?.data?.message || "Gagal menambahkan customer")
    } finally {
      setSavingCustomer(false)
    }
  }

  const handleCreateVehicle = async () => {
    if (!selectedCustomerId) {
      setError("Pilih customer terlebih dahulu")
      return
    }

    if (!newVehiclePlate.trim()) {
      setError("Plat nomor harus diisi")
      return
    }

    if (!newVehicleBrand.trim()) {
      setError("Merek kendaraan harus diisi")
      return
    }

    if (!newVehicleModel.trim()) {
      setError("Model kendaraan harus diisi")
      return
    }

    setSavingVehicle(true)
    setError("")

    try {
      const response = await api.post("/vehicles", {
        customerId: selectedCustomerId,
        plateNumber: newVehiclePlate.trim().toUpperCase(),
        brand: newVehicleBrand.trim(),
        model: newVehicleModel.trim(),
      })

      const newVehicle = response.data.vehicle

      // Tambahkan kendaraan baru ke list
      setVehicles((prev) => [...prev, newVehicle])

      // Langsung pilih kendaraan baru
      setSelectedVehicleId(newVehicle.id)

      // Reset form
      setNewVehiclePlate("")
      setNewVehicleBrand("")
      setNewVehicleModel("")

      setShowNewVehicleForm(false)
      setShowVehicleDropdown(false)

      Alert.alert("Sukses", "Kendaraan berhasil ditambahkan")
    } catch (error: any) {
      console.error("Create vehicle error:", error)

      setError(error.response?.data?.message || "Gagal menambahkan kendaraan")
    } finally {
      setSavingVehicle(false)
    }
  }
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
      const orderData = {
        customerId: selectedCustomerId,
        vehicleId: selectedVehicleId,
        items: selectedServices,
      }

      if (isEdit) {
        await api.patch(`/orders/${id}`, orderData)

        Alert.alert("Sukses", "Order berhasil diperbarui", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      } else {
        await api.post("/orders", orderData)

        Alert.alert("Sukses", "Order berhasil dibuat", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      }
    } catch (error: any) {
      console.error("Error saving order:", error.response?.data)

      setError(error.response?.data?.message || "Gagal menyimpan order")
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

        <Text style={styles.title}>
          {isEdit ? "Edit Order" : "Buat Order Baru"}
        </Text>

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
            onPress={() => {
              setShowCustomerDropdown(!showCustomerDropdown)
              setShowNewCustomerForm(false)
            }}
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
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps='handled'
              >
                {customers.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCustomerId(item.id)
                      setShowCustomerDropdown(false)
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.name}</Text>

                    <Text style={styles.dropdownPhone}>{item.phone}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* TAMBAH CUSTOMER */}
          {!showNewCustomerForm && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setShowNewCustomerForm(true)
                setShowCustomerDropdown(false)
                setError("")
              }}
            >
              <Ionicons name='add-circle-outline' size={18} color='#2563eb' />

              <Text style={styles.addButtonText}>Tambah Customer Baru</Text>
            </TouchableOpacity>
          )}

          {/* FORM CUSTOMER BARU */}
          {showNewCustomerForm && (
            <View style={styles.newForm}>
              <View style={styles.newFormHeader}>
                <View style={styles.newFormTitleRow}>
                  <Ionicons name='person-outline' size={18} color='#2563eb' />

                  <Text style={styles.newFormTitle}>Customer Baru</Text>
                </View>

                <TouchableOpacity onPress={() => setShowNewCustomerForm(false)}>
                  <Text style={styles.cancelText}>Batal</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder='Nama customer'
                value={newCustomerName}
                onChangeText={setNewCustomerName}
              />

              <TextInput
                style={styles.input}
                placeholder='No. Telepon'
                value={newCustomerPhone}
                onChangeText={setNewCustomerPhone}
                keyboardType='phone-pad'
              />

              <TextInput
                style={styles.input}
                placeholder='Alamat (opsional)'
                value={newCustomerAddress}
                onChangeText={setNewCustomerAddress}
              />

              <TouchableOpacity
                style={styles.saveNewButton}
                onPress={handleCreateCustomer}
                disabled={savingCustomer}
              >
                {savingCustomer ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <Text style={styles.saveNewButtonText}>Simpan Customer</Text>
                )}
              </TouchableOpacity>
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
                setShowNewVehicleForm(false)
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

          {/* LIST KENDARAAN */}
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

          {/* TAMBAH KENDARAAN */}
          {selectedCustomerId && !showNewVehicleForm && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setShowNewVehicleForm(true)
                setShowVehicleDropdown(false)
                setError("")
              }}
            >
              <Ionicons name='add-circle-outline' size={18} color='#2563eb' />

              <Text style={styles.addButtonText}>Tambah Kendaraan Baru</Text>
            </TouchableOpacity>
          )}

          {/* FORM KENDARAAN BARU */}
          {showNewVehicleForm && (
            <View style={styles.newForm}>
              <View style={styles.newFormHeader}>
                <View style={styles.newFormTitleRow}>
                  <Ionicons name='car-outline' size={18} color='#2563eb' />

                  <Text style={styles.newFormTitle}>Kendaraan Baru</Text>
                </View>

                <TouchableOpacity onPress={() => setShowNewVehicleForm(false)}>
                  <Text style={styles.cancelText}>Batal</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder='Plat Nomor'
                value={newVehiclePlate}
                onChangeText={setNewVehiclePlate}
                autoCapitalize='characters'
              />

              <TextInput
                style={styles.input}
                placeholder='Merek'
                value={newVehicleBrand}
                onChangeText={setNewVehicleBrand}
              />

              <TextInput
                style={styles.input}
                placeholder='Model'
                value={newVehicleModel}
                onChangeText={setNewVehicleModel}
              />

              <TouchableOpacity
                style={styles.saveNewButton}
                onPress={handleCreateVehicle}
                disabled={savingVehicle}
              >
                {savingVehicle ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <Text style={styles.saveNewButtonText}>Simpan Kendaraan</Text>
                )}
              </TouchableOpacity>
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
            <Text style={styles.submitButtonText}>
              {isEdit ? "Simpan Perubahan" : "Buat Order"}
            </Text>
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

  dropdownList: {
    height: 200,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  dropdownPhone: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
  },

  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb",
  },

  newForm: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
  },

  newFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  newFormTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  newFormTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  cancelText: {
    fontSize: 13,
    color: "#6b7280",
  },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
    fontSize: 14,
    color: "#111827",
  },

  saveNewButton: {
    height: 44,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  saveNewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
