import api from "@/lib/api"

export interface VerifyOutletResponse {
  message: string
  verified: boolean
  outletAccessToken: string
}

export const verifyOutletQr = async (
  qrValue: string,
): Promise<VerifyOutletResponse> => {
  const response = await api.post<VerifyOutletResponse>(
    "/customer/outlet/verify",
    {
      qrValue,
    },
  )

  return response.data
}
