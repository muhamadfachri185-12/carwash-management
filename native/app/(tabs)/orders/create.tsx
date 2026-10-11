import { useState, useEffect } from "react"
import {
  View,
  Text,
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

  // useEffect(() => {
  //   if (id) {
  //     fetchOrderForEdit()
  //   }
  // }, [id])

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
      <View className='flex-1 items-center justify-center bg-gray-50'>
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
          {isEdit ? "Edit Order" : "Buat Order Baru"}
        </Text>

        <View className='w-10 h-10' />
      </View>

      {/* ERROR */}
      {error ? (
        <View className='mx-4 mt-4 p-3 bg-red-50 rounded-lg border border-red-200'>
          <Text className='text-sm text-red-600'>{error}</Text>
        </View>
      ) : null}

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <View className='px-4 pt-4 pb-6'>
          {/* CUSTOMER */}
          <View className='mb-6'>
            <Text className='mb-3 text-base font-semibold text-gray-900'>
              1. Pilih Customer
            </Text>

            <TouchableOpacity
              className='h-12 flex-row items-center justify-between px-4 bg-white rounded-lg border border-gray-300'
              onPress={() => {
                setShowCustomerDropdown(!showCustomerDropdown)
                setShowNewCustomerForm(false)
              }}
            >
              <Text
                className={`flex-1 text-sm ${
                  selectedCustomerId ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {selectedCustomer?.name || "Pilih Customer"}
              </Text>

              <Ionicons
                name={showCustomerDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color='#6b7280'
              />
            </TouchableOpacity>

            {/* CUSTOMER DROPDOWN */}
            {showCustomerDropdown && (
              <View className='h-52 mt-1 bg-white rounded-lg border border-gray-300 overflow-hidden'>
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  keyboardShouldPersistTaps='handled'
                >
                  {customers.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className='px-3 py-3 border-b border-gray-300'
                      onPress={() => handleCustomerSelect(item.id)}
                    >
                      <Text className='text-sm font-medium text-gray-700'>
                        {item.name}
                      </Text>

                      <Text className='mt-0.5 text-xs text-gray-500'>
                        {item.phone}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* TAMBAH CUSTOMER */}
            {!showNewCustomerForm && (
              <TouchableOpacity
                className='flex-row items-center gap-1.5 mt-2 py-2'
                onPress={() => {
                  setShowNewCustomerForm(true)
                  setShowCustomerDropdown(false)
                  setError("")
                }}
              >
                <Ionicons name='add-circle-outline' size={18} color='#2563eb' />

                <Text className='text-sm font-medium text-blue-600'>
                  Tambah Customer Baru
                </Text>
              </TouchableOpacity>
            )}

            {/* FORM CUSTOMER BARU */}
            {showNewCustomerForm && (
              <View className='mt-2 p-3 bg-white rounded-lg border border-gray-300'>
                <View className='flex-row items-center justify-between mb-3'>
                  <View className='flex-row items-center gap-1.5'>
                    <Ionicons name='person-outline' size={18} color='#2563eb' />

                    <Text className='text-sm font-semibold text-gray-900'>
                      Customer Baru
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowNewCustomerForm(false)}
                  >
                    <Text className='text-xs text-gray-500'>Batal</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  className='h-11 mb-2 px-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-300'
                  placeholder='Nama customer'
                  value={newCustomerName}
                  onChangeText={setNewCustomerName}
                />

                <TextInput
                  className='h-11 mb-2 px-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-300'
                  placeholder='No. Telepon'
                  value={newCustomerPhone}
                  onChangeText={setNewCustomerPhone}
                  keyboardType='phone-pad'
                />

                <TextInput
                  className='h-11 mb-2 px-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-300'
                  placeholder='Alamat (opsional)'
                  value={newCustomerAddress}
                  onChangeText={setNewCustomerAddress}
                />

                <TouchableOpacity
                  className={`h-11 mt-1 rounded-lg items-center justify-center ${
                    savingCustomer ? "bg-blue-400" : "bg-blue-600"
                  }`}
                  onPress={handleCreateCustomer}
                  disabled={savingCustomer}
                >
                  {savingCustomer ? (
                    <ActivityIndicator color='#fff' />
                  ) : (
                    <Text className='text-sm font-semibold text-white'>
                      Simpan Customer
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* VEHICLE */}
          <View className='mb-6'>
            <Text className='mb-3 text-base font-semibold text-gray-900'>
              2. Pilih Kendaraan
            </Text>

            <TouchableOpacity
              className={`h-12 flex-row items-center justify-between px-4 rounded-lg border border-gray-300 ${
                !selectedCustomerId ? "bg-gray-100 opacity-60" : "bg-white"
              }`}
              onPress={() => {
                if (selectedCustomerId) {
                  setShowVehicleDropdown(!showVehicleDropdown)
                  setShowNewVehicleForm(false)
                }
              }}
              disabled={!selectedCustomerId}
            >
              <Text
                className={`flex-1 text-sm ${
                  selectedVehicleId ? "text-gray-900" : "text-gray-400"
                }`}
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
              <View className='h-52 mt-1 bg-white rounded-lg border border-gray-300 overflow-hidden'>
                {filteredVehicles.length === 0 ? (
                  <View className='p-5 items-center'>
                    <Text className='text-sm text-gray-500'>
                      Customer belum memiliki kendaraan
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredVehicles}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className='px-3 py-3 border-b border-gray-200'
                        onPress={() => handleVehicleSelect(item.id)}
                      >
                        <Text className='text-sm font-medium text-gray-900'>
                          {item.plateNumber}
                        </Text>

                        <Text className='mt-0.5 text-xs text-gray-500'>
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
                className='flex-row items-center gap-1.5 mt-2 py-2'
                onPress={() => {
                  setShowNewVehicleForm(true)
                  setShowVehicleDropdown(false)
                  setError("")
                }}
              >
                <Ionicons name='add-circle-outline' size={18} color='#2563eb' />

                <Text className='text-sm font-medium text-blue-600'>
                  Tambah Kendaraan Baru
                </Text>
              </TouchableOpacity>
            )}

            {/* FORM KENDARAAN BARU */}
            {showNewVehicleForm && (
              <View className='mt-2 p-3 bg-white rounded-lg border border-gray-300'>
                <View className='flex-row items-center justify-between mb-3'>
                  <View className='flex-row items-center gap-1.5'>
                    <Ionicons name='car-outline' size={18} color='#2563eb' />

                    <Text className='text-sm font-semibold text-gray-900'>
                      Kendaraan Baru
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowNewVehicleForm(false)}
                  >
                    <Text className='text-xs text-gray-500'>Batal</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  className='h-11 mb-2 px-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-300'
                  placeholder='Plat Nomor'
                  value={newVehiclePlate}
                  onChangeText={setNewVehiclePlate}
                  autoCapitalize='characters'
                />

                <TextInput
                  className='h-11 mb-2 px-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-300'
                  placeholder='Merek'
                  value={newVehicleBrand}
                  onChangeText={setNewVehicleBrand}
                />

                <TextInput
                  className='h-11 mb-2 px-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-300'
                  placeholder='Model'
                  value={newVehicleModel}
                  onChangeText={setNewVehicleModel}
                />

                <TouchableOpacity
                  className={`h-11 mt-1 rounded-lg items-center justify-center ${
                    savingVehicle ? "bg-blue-400" : "bg-blue-600"
                  }`}
                  onPress={handleCreateVehicle}
                  disabled={savingVehicle}
                >
                  {savingVehicle ? (
                    <ActivityIndicator color='#fff' />
                  ) : (
                    <Text className='text-sm font-semibold text-white'>
                      Simpan Kendaraan
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* SERVICES */}
          <View className='mb-6'>
            <Text className='mb-3 text-base font-semibold text-gray-900'>
              3. Pilih Service
            </Text>

            {services.map((service) => {
              const selected = selectedServices.find(
                (item) => item.serviceId === service.id,
              )

              const quantity = selected?.quantity || 0

              return (
                <View
                  key={service.id}
                  className='p-3 mb-2 bg-white rounded-lg border border-gray-200'
                >
                  <View className='mb-2'>
                    <Text className='text-[15px] font-semibold text-gray-900'>
                      {service.name}
                    </Text>

                    <Text className='mt-1 text-sm text-blue-600'>
                      Rp {Number(service.price).toLocaleString("id-ID")}
                    </Text>

                    <Text className='mt-0.5 text-xs text-gray-500'>
                      {service.duration} menit
                    </Text>
                  </View>

                  <View className='flex-row items-center gap-3'>
                    <TouchableOpacity
                      className='w-9 rounded-lg bg-gray-100 items-center justify-center'
                      onPress={() =>
                        handleServiceQuantityChange(service.id, -1)
                      }
                    >
                      <Ionicons name='remove' size={20} color='#374151' />
                    </TouchableOpacity>

                    <Text className='min-w-[30px] text-lg font-semibold text-gray-900 text-center'>
                      {quantity}
                    </Text>

                    <TouchableOpacity
                      className='w-9 h-9 rounded-lg bg-gray-100 items-center justify-center'
                      onPress={() => handleServiceQuantityChange(service.id, 1)}
                    >
                      <Ionicons name='add' size={20} color='#374151' />
                    </TouchableOpacity>
                  </View>

                  {quantity > 0 && (
                    <View className='flex-row justify-between mt-2 pt-2 border-t border-gray-200'>
                      <Text className='text-[13px] text-gray-500'>
                        Subtotal:
                      </Text>

                      <Text className='text-[13px] font-semibold text-gray-900'>
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
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className='p-4 bg-white border-t border-gray-200'>
        <View className='flex-row justify-between mb-3'>
          <Text className='text-base text-gray-500'>Total Estimasi</Text>

          <Text className='text-xl font-bold text-gray-900'>
            Rp {total.toLocaleString("id-ID")}
          </Text>
        </View>

        <TouchableOpacity
          className={`h-12 rounded-lg items-center justify-center ${
            saving ? "bg-blue-400" : "bg-blue-600"
          }`}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text className='text-base font-semibold text-white'>
              {isEdit ? "Simpan Perubahan" : "Buat Order"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
