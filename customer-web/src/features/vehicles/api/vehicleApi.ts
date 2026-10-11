import api from "@/lib/api"

import type {
  Vehicle,
  VehicleFormData,
  GetVehiclesResponse,
  VehicleResponse,
} from "@/features/vehicles/types/vehicle"

export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get<GetVehiclesResponse>("/vehicles")

  return response.data.vehicles
}

export const createVehicle = async (
  data: VehicleFormData,
): Promise<Vehicle> => {
  const response = await api.post<VehicleResponse>("/vehicles", data)

  return response.data.vehicle
}
