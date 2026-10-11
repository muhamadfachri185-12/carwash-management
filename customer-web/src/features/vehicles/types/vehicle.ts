export type Vehicle = {
  id: number
  customerId: number
  plateNumber: string
  brand: string
  model: string
  createdAt: string
}

export type VehicleFormData = {
  plateNumber: string
  brand: string
  model: string
}

export type GetVehiclesResponse = {
  vehicles: Vehicle[]
}

export type VehicleResponse = {
  vehicle: Vehicle
  message?: string
}
