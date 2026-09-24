export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("id-ID")
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
  return phoneRegex.test(phone)
}

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.message === "Network Error") {
    return "Gagal terhubung ke server. Periksa koneksi internet Anda."
  }

  return "Terjadi kesalahan. Silakan coba lagi."
}
