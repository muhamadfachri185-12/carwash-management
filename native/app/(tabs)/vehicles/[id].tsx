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
import { Customer, Vehicle } from "../../../types/order"
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
      const response = await api.get(`/customers`)
      setCustomers(response.data.customers)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const fetchVehicle = async (vehicleId: number) => {
    try {
      setLoading(true)
      const response = await api.get(`/vehicle/${vehicleId}`)
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
    if (!brand.trim()) {
      setError("Model harus diisi")
      return false
    }
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
        Alert.alert("Sukses", "Kendaraan berhasil diperbarui")
      }
      router.back()
    } catch (error: any) {
      setError(error.response?.data?.message || "Gagal menyimpan data")
    } finally {
      setSaving(false)
    }
  }
  const handleDelete = async () => {
    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus kendaraan ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/vehicles/${id}`)
              router.back()
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={24} color='#374151' />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isCreate ? "Tambah Kendaraan" : "Edit Kendaraan"}
          </Text>
          {isEdit && (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name='trash-outline' size={24} color='#ef4444' />
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Customer *</Text>
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
                {selectedCustomerId
                  ? customers.find((c) => c.id === selectedCustomerId)?.name
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
                <FlatList
                  data={customers}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCustomerId(item.id)
                        setShowCustomerDropdown(false)
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedCustomerId === item.id &&
                            styles.dropdownItemActive,
                        ]}
                      >
                        {item.name} - {item.phone}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>

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
  form: { padding: 16, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151" },
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
  dropdownButtonText: { fontSize: 16, color: "#111827" },
  placeholderText: { color: "#9ca3af" },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "#fff",
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dropdownItemText: { fontSize: 14, color: "#374151" },
  dropdownItemActive: { color: "#2563eb", fontWeight: "600" },
  button: {
    height: 48,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: { color: "#dc2626", fontSize: 14 },
})
