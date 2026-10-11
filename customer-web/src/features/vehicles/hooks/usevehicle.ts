import { useCallback, useEffect, useState } from "react"
import api from "@/lib/api"
import type {
  Vehicle,
  VehicleFormData,
  GetVehiclesResponse,
  VehicleResponse,
} from "../types/vehicle"

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const response = await api.get<GetVehiclesResponse>("/vehicles")
      setVehicles(response.data.vehicles)
    } catch (err) {
      setError("Gagal mengambil data kendaran")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchVehicles()
  }, [fetchVehicles])

  const createVehicle = async (data: VehicleFormData) => {
    const response = await api.post<VehicleResponse>("/vehciles", data)

    await fetchVehicles()
    return response.data
  }

  const updateVehicle = async (id: number, data: VehicleFormData) => {
    const response = await api.patch<VehicleResponse>(`/vehicles/${id}`, data)
    await fetchVehicles()

    return response.data
  }

  const deleteVehicle = async (id: number) => {
    await api.delete(`/vehicles/${id}`)

    setVehicles((currentVehicles) =>
      currentVehicles.filter((vehicle) => vehicle.id !== id),
    )
  }

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  }
}
