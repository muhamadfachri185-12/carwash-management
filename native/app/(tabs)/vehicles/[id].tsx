import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native"

import { useRouter, useLocalSearchParams } from "expo-router"
import api from "../../../lib/api"
import { Customer } from "../../../types/order"
import { Ionicons } from "@expo/vector-icons"

export default function VehicleFormScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  const isEdit = id && id !== "new"
  const isCreate = id === "new"

  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  )

  const [plateNumber, setPlateNumber] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")

  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCustomers()

    if (isEdit && id) {
      fetchVehicle(Number(id))
    }
  }, [id])

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers")

      setCustomers(response.data.customers)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setError("Gagal memuat data customer")
    }
  }

  const fetchVehicle = async (vehicleId: number) => {
    try {
      setLoading(true)

      const response = await api.get(`/vehicles/${vehicleId}`)

      const vehicle = response.data.vehicle

      setSelectedCustomerId(vehicle.customerId)
      setPlateNumber(vehicle.plateNumber)
      setBrand(vehicle.brand)
      setModel(vehicle.model)
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat kendaraan",
      )
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    setError("")

    if (!selectedCustomerId) {
      setError("Customer harus dipilih")
      return false
    }

    if (!plateNumber.trim()) {
      setError("Plat nomor harus diisi")
      return false
    }

    if (!brand.trim()) {
      setError("Merek harus diisi")
      return false
    }

    if (!model.trim()) {
      setError("Model harus diisi")
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setError("")

    try {
      const vehicleData = {
        customerId: selectedCustomerId,
        plateNumber: plateNumber.trim().toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
      }

      if (isCreate) {
        await api.post("/vehicles", vehicleData)

        Alert.alert("Sukses", "Kendaraan berhasil ditambahkan", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])

        return
      }

      if (isEdit && id) {
        await api.patch(`/vehicles/${id}`, vehicleData)

        Alert.alert("Sukses", "Kendaraan berhasil diperbarui", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      }
    } catch (error: any) {
      console.error("Save vehicle error:", error)

      setError(
        error.response?.data?.message || "Gagal menyimpan data kendaraan",
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus kendaraan ini?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/vehicles/${id}`)

              Alert.alert("Sukses", "Kendaraan berhasil dihapus", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ])
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Gagal menghapus kendaraan",
              )
            }
          },
        },
      ],
    )
  }

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      className='flex-1 bg-gray-50'
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className='flex-1 bg-gray-50'>
        {/* HEADER */}
        <View className='flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200'>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={24} color='#374151' />
          </TouchableOpacity>

          <Text className='text-lg font-semibold text-gray-900'>
            {isCreate ? "Tambah Kendaraan" : "Edit Kendaraan"}
          </Text>

          {isEdit ? (
            <TouchableOpacity
              onPress={handleDelete}
              className='w-10 h-10 items-center justify-center'
            >
              <Ionicons name='trash-outline' size={24} color='#ef4444' />
            </TouchableOpacity>
          ) : (
            <View className='w-10 h-10' />
          )}
        </View>

        {/* ERROR */}
        {error ? (
          <View className='mx-4 mt-4 p-3 bg-red-50 rounded-lg border border-red-200'>
            <Text className='text-sm text-red-600'>{error}</Text>
          </View>
        ) : null}

        {/* FORM */}
        <View className='p-4 gap-5'>
          {/* CUSTOMER */}
          <View className='gap-2'>
            <Text className='text-sm font-medium text-gray-700'>
              Customer *
            </Text>

            <TouchableOpacity
              className='h-12 flex-row items-center justify-between px-4 bg-white rounded-lg border border-gray-300'
              onPress={() => setShowCustomerDropdown(!showCustomerDropdown)}
              disabled={saving}
            >
              <Text
                className={`flex-1 mr-2 text-base ${
                  selectedCustomerId ? "text-gray-900" : "text-gray-400"
                }`}
                numberOfLines={1}
              >
                {selectedCustomerId
                  ? customers.find((c) => c.id === selectedCustomerId)?.name ||
                    "Customer tidak ditemukan"
                  : "Pilih Customer"}
              </Text>

              <Ionicons
                name={showCustomerDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color='#6b7280'
              />
            </TouchableOpacity>

            {showCustomerDropdown && (
              <View className='h-52 mt-1 bg-white rounded-lg border border-gray-300 overflow-hidden'>
                {customers.length === 0 ? (
                  <View className='p-5 items-center'>
                    <Text className='text-sm text-gray-500'>
                      Tidak ada customer
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={customers}
                    keyExtractor={(item) => item.id.toString()}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps='handled'
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className='px-3 py-3 border-b border-gray-200'
                        onPress={() => {
                          setSelectedCustomerId(item.id)
                          setShowCustomerDropdown(false)
                          setError("")
                        }}
                      >
                        <Text
                          className={`text-sm ${
                            selectedCustomerId === item.id
                              ? "font-semibold text-blue-600"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {item.name}
                        </Text>

                        <Text className='mt-0.5 text-xs text-gray-500'>
                          {item.phone}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            )}
          </View>

          {/* PLAT */}
          <View className='gap-2'>
            <Text className='text-sm font-medium text-gray-700'>
              Plat Nomor *
            </Text>

            <TextInput
              className='h-12 px-4 text-base text-gray-900 bg-white rounded-lg border border-gray-300'
              placeholder='B 1234 ABC'
              value={plateNumber}
              onChangeText={setPlateNumber}
              editable={!saving}
              autoCapitalize='characters'
            />
          </View>

          {/* BRAND */}
          <View className='gap-2'>
            <Text className='text-sm font-medium text-gray-700'>Merek *</Text>

            <TextInput
              className='h-12 px-4 text-base text-gray-900 bg-white rounded-lg border border-gray-300'
              placeholder='Toyota, Honda, dll'
              value={brand}
              onChangeText={setBrand}
              editable={!saving}
            />
          </View>

          {/* MODEL */}
          <View className='gap-2'>
            <Text className='text-sm font-medium text-gray-700'>Model *</Text>

            <TextInput
              className='h-12 px-4 text-base text-gray-900 bg-white rounded-lg border border-gray-300'
              placeholder='Avanza, City, dll'
              value={model}
              onChangeText={setModel}
              editable={!saving}
            />
          </View>

          {/* SAVE */}
          <TouchableOpacity
            className={`h-12 mt-2 rounded-lg items-center justify-center ${
              saving ? "bg-blue-400" : "bg-blue-600"
            }`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text className='text-base font-semibold text-white'>
                {isCreate ? "Simpan" : "Update"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
