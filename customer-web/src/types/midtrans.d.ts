interface MidtransSnapResult {
  status_code: string
  transaction_status: string
  order_id: string
}

interface MidtransSnapOptions {
  onSuccess?: (result: MidtransSnapResult) => void
  onPending?: (result: MidtransSnapResult) => void
  onError?: (result: MidtransSnapResult) => void
  onClose?: () => void
}

interface MidtransSnap {
  pay: (snapToken: string, options?: MidtransSnapOptions) => void
}

interface Window {
  snap?: MidtransSnap
}
