import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Service, GetServicesResponse } from "../types/service"

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        setError("")

        const response = await api.get<GetServicesResponse>("/services")
        setServices(response.data.services)
      } catch (error: any) {
        console.error(
          "Gagal mengambil services:",
          error.response?.data || error,
        )
        setError(
          error.response?.data?.message ||
            "Gagal memuat layanan. Silakan coba lagi.",
        )
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  return {
    services,
    loading,
    error,
  }
}
