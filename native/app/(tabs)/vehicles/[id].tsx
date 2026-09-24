import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

      const response = await api.get(`/vehicles/${id}`)

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
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={24} color='#374151' />
          </TouchableOpacity>

          <Text style={styles.title}>
            {isCreate ? "Tambah Kendaraan" : "Edit Kendaraan"}
          </Text>

          {isEdit ? (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name='trash-outline' size={24} color='#ef4444' />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        {/* ERROR */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* FORM */}
        <View style={styles.form}>
          {/* CUSTOMER */}
          <View style={styles.field}>
            <Text style={styles.label}>Customer *</Text>

            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCustomerDropdown(!showCustomerDropdown)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !selectedCustomerId && styles.placeholderText,
                ]}
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
              <View style={styles.dropdownList}>
                {customers.length === 0 ? (
                  <View style={styles.emptyCustomer}>
                    <Text style={styles.emptyCustomerText}>
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
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedCustomerId(item.id)
                          setShowCustomerDropdown(false)
                          setError("")
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedCustomerId === item.id &&
                              styles.dropdownItemActive,
                          ]}
                        >
                          {item.name}
                        </Text>

                        <Text style={styles.dropdownPhone}>{item.phone}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            )}
          </View>

          {/* PLAT */}
          <View style={styles.field}>
            <Text style={styles.label}>Plat Nomor *</Text>

            <TextInput
              style={styles.input}
              placeholder='B 1234 ABC'
              value={plateNumber}
              onChangeText={setPlateNumber}
              editable={!saving}
              autoCapitalize='characters'
            />
          </View>

          {/* BRAND */}
          <View style={styles.field}>
            <Text style={styles.label}>Merek *</Text>

            <TextInput
              style={styles.input}
              placeholder='Toyota, Honda, dll'
              value={brand}
              onChangeText={setBrand}
              editable={!saving}
            />
          </View>

          {/* MODEL */}
          <View style={styles.field}>
            <Text style={styles.label}>Model *</Text>

            <TextInput
              style={styles.input}
              placeholder='Avanza, City, dll'
              value={model}
              onChangeText={setModel}
              editable={!saving}
            />
          </View>

          {/* SAVE */}
          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>
                {isCreate ? "Simpan" : "Update"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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

  form: {
    padding: 16,
    gap: 20,
  },

  field: {
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#111827",
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

  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    marginRight: 8,
  },

  placeholderText: {
    color: "#9ca3af",
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

  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },

  dropdownItemActive: {
    color: "#2563eb",
    fontWeight: "600",
  },

  dropdownPhone: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
  },

  emptyCustomer: {
    padding: 20,
    alignItems: "center",
  },

  emptyCustomerText: {
    color: "#6b7280",
  },

  button: {
    height: 48,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
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
