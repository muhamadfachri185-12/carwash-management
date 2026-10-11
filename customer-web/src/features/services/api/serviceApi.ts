import api from "@/lib/api"

import type { Service, GetServicesResponse } from "@/features/services/types/service"

export const getServices = async (): Promise<Service[]> => {
  const response = await api.get<GetServicesResponse>("/services")

  return response.data.services
}
