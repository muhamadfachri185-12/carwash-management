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

      console.log("RESPONSE:", response.data)
      const customer = response.data.customer
      setName(customer.name)
      setPhone(customer.phone)
      setAddress(customer.address || "")
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          JSON.stringify(error.response?.data) ||
          "Gagal memuat customer",
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
        await api.patch(`/customers/${id}`, customerData)
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
          <TouchableOpacity
            onPress={() => router.back()}
            className='w-10 h-10 items-center justify-center'
          >
            <Ionicons name='arrow-back' size={24} color='#374151' />
          </TouchableOpacity>
          <Text className='text-lg font-semibold text-gray-900'>
            {isCreate ? "Tambah Customer" : "Edit Customer"}
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

        {/* Error */}
        {error ? (
          <View className='mx-4 mt-4 p-3 bg-red-50 rounded-lg border border-red-200'>
            <Text className='text-sm text-red-600'>{error}</Text>
          </View>
        ) : null}

        {/*FORM */}
        <View className='p-4 gap-5'>
          {/*NAMA*/}
          <View className='gap-2'>
            <Text className='text-sm font-medium text-gray-700'>Nama *</Text>
            <TextInput
              className='h-12 px-4 text-base text-gray-900 bg-white rounded-lg border border-gray-300'
              placeholder='Nama customer'
              value={name}
              onChangeText={setName}
              editable={!saving}
            />
          </View>

          {/*TELEPON*/}
          <View className='gap-2'>
            <Text className='text-sm font-medium text-gray-700'>Telepon *</Text>
            <TextInput
              className='h-12 px-4 text-base text-gray-900 bg-white rounded-lg border border-gray-300'
              placeholder='08xx-xxxx-xxxx'
              value={phone}
              onChangeText={setPhone}
              keyboardType='phone-pad'
              editable={!saving}
            />
          </View>
          {/* ALAMAT */}
          <View className='gap-2'>
            <Text className='text-sm font-medium text-gray-700'>Alamat</Text>
            <TextInput
              className='h-20 px-4 py-3 text-base text-gray-900 bg-white rounded-lg border border-gray-300'
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
            className={`h-12 mt-2 rounded-lg items-center justify-center ${saving ? "bg-blue-400" : "bg-blue-600"}`}
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
