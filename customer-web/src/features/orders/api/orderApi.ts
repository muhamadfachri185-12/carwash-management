import api from "@/lib/api"

import type { CustomerOrder } from "@/features/orders/types/order.types"

export interface NewOrderVehicle {
  plateNumber: string
  brand: string
  model: string
}

export interface CreateCustomerOrderData {
  vehicleId?: number
  vehicle?: NewOrderVehicle
  items: {
    serviceId: number
    quantity: number
  }[]
}

export interface snapTransactionResponse {
  message: string
  redirect_url: string
  snap_token: string
}

export const createSnapTransaction = async (
  orderId: number,
): Promise<snapTransactionResponse> => {
  const response = await api.post(`/customer/orders/${orderId}/pay`)

  return response.data
}

export const getCustomerOrders = async (): Promise<CustomerOrder[]> => {
  const response = await api.get("/customer/orders")

  return response.data.orders
}

export const getCustomerOrderById = async (
  orderId: number,
): Promise<CustomerOrder> => {
  const response = await api.get(`/customer/orders/${orderId}`)

  return response.data.order
}

export const createCustomerOrder = async (
  data: CreateCustomerOrderData,
): Promise<CustomerOrder> => {
  const outletAccessToken = sessionStorage.getItem("outletAccessToken")

  if (!outletAccessToken) {
    throw new Error("Outlet access required")
  }

  const response = await api.post("/customer/orders", data, {
    headers: {
      "X-Outlet-Access-Token": outletAccessToken,
    },
  })

  return response.data.order
}
