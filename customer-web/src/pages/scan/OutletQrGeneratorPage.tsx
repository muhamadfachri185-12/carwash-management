import { useEffect, useRef } from "react"
import QRCode from "qrcode"

const OUTLET_QR_VALUE = "CARWASH_OUTLET:MAIN"

const OutletQrGeneratorPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    QRCode.toCanvas(
      canvasRef.current,
      OUTLET_QR_VALUE,
      {
        width: 300,
        margin: 2,
      },
      (error) => {
        if (error) {
          console.error("Failed to generate QR:", error)
        }
      },
    )
  }, [])

  const handleDownload = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")

    link.download = "carwash-outlet-qr.png"
    link.href = canvasRef.current.toDataURL("image/png")

    link.click()
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='w-full max-w-md space-y-6 text-center'>
        <div>
          <h1 className='text-2xl font-bold'>CarWash Outlet QR</h1>

          <p className='mt-2 text-sm text-muted-foreground'>
            Scan QR ini untuk membuat pesanan di outlet.
          </p>
        </div>

        <div className='flex justify-center'>
          <div className='rounded-xl border bg-white p-4 shadow-sm'>
            <canvas ref={canvasRef} />
          </div>
        </div>

        <div className='rounded-lg bg-muted p-4 text-sm'>
          <p className='font-medium'>QR Value</p>

          <p className='mt-1 break-all text-muted-foreground'>
            {OUTLET_QR_VALUE}
          </p>
        </div>

        <button
          type='button'
          onClick={handleDownload}
          className='w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90'
        >
          Download QR
        </button>
      </div>
    </div>
  )
}

export default OutletQrGeneratorPage
