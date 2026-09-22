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
} from "react-native"

import { useRouter, useLocalSearchParams } from "expo-router"
import api from "../../../lib/api"
import { Ionicons } from "@expo/vector-icons"

export default function CustomerFormScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const isEdit = id && id !== "new"
  const isCreate = id === "new"

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isEdit && id) {
      fetchCustomer(Number(id))
    }
  }, [id])

  const fetchCustomer = async (customerId: number) => {
    try {
      setLoading(true)
      const response = await api.get(`/customers/${customerId}`)
      const customer = response.data.customer
      setName(customer.name)
      setPhone(customer.phone)
      setAddress(customer.address || "")
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat customer",
      )
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!name.trim()) {
      setError("Nama harus diisi")
      return false
    }
    if (!phone.trim()) {
      setError("Nomor telepon harus diisi")
      return false
    }
    if (phone.length < 10) {
      setError("Nomor telepon minimal 10 angka")
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setError("")

    try {
      const customerData = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      }
      if (isCreate) {
        await api.post("/customers", customerData)
        Alert.alert("Sukses", "Customer berhasil ditambahkan")
      } else {
        await api.post(`/customers/${id}`, customerData)
        Alert.alert("Sukses", "Customer berhasil diperbarui")
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
      "Apakah Anda yakin ingin menghapus customer ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/customers/${id}`)
              router.back()
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Gagal menghapus customer",
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
            {isCreate ? "Tambah Customer" : "Edit Customer"}
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
            <Text style={styles.label}>Nama *</Text>
            <TextInput
              style={styles.input}
              placeholder='Nama customer'
              value={name}
              onChangeText={setName}
              editable={!saving}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telepon *</Text>
            <TextInput
              style={styles.input}
              placeholder='08xx-xxxx-xxxx'
              value={phone}
              onChangeText={setPhone}
              keyboardType='phone-pad'
              editable={!saving}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Alamat</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder='Alamat (opsional)'
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical='top'
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
  textArea: { height: 80, paddingVertical: 12 },
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
