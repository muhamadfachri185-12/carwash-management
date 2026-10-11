import { useEffect, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  CircleAlert,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ScanLine,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { verifyOutletQr } from "@/features/orders/api/outletApi"

export default function ScanPage() {
  const navigate = useNavigate()

  const [error, setError] = useState("")
  const [cameraError, setCameraError] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const scannerId = "carwash-qr-reader"
    const scanner = new Html5Qrcode(scannerId)

    let active = true
    let processing = false

    async function handleQrScan(decodedText: string) {
      if (!active || processing) return

      processing = true
      setScanning(false)
      setVerifying(true)
      setError("")
      setCameraError(false)

      try {
        const result = await verifyOutletQr(decodedText)

        if (!result.verified || !result.outletAccessToken) {
          throw new Error("QR outlet tidak valid")
        }

        if (!active) return

        sessionStorage.setItem("outletAccessToken", result.outletAccessToken)

        try {
          if (scanner.isScanning) {
            await scanner.stop()
          }
        } catch (stopError) {
          console.error("Gagal menghentikan kamera:", stopError)
        }

        if (!active) return

        navigate("/orders/new", {
          state: {
            outletQr: decodedText,
          },
        })
      } catch (error) {
        if (!active) return

        console.error("Outlet QR verification error:", error)

        setVerifying(false)
        setScanning(true)
        setError(
          "QR tidak valid atau bukan QR resmi outlet CarWash. Arahkan kamera ke QR resmi dan coba lagi.",
        )

        processing = false
      }
    }

    async function startScanner() {
      try {
        setError("")
        setCameraError(false)
        setScanning(false)

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: {
              width: 220,
              height: 220,
            },
            aspectRatio: 1,
          },
          (decodedText) => {
            void handleQrScan(decodedText)
          },
          () => {
            // Error saat QR belum terbaca tidak perlu ditampilkan.
          },
        )

        if (active) {
          setScanning(true)
        } else {
          await scanner.stop().catch(() => {})
        }
      } catch (error) {
        if (!active) return

        console.error("Camera error:", error)

        setScanning(false)
        setCameraError(true)
        setError(
          "Kamera tidak dapat diakses. Periksa izin kamera browser dan pastikan halaman dibuka melalui HTTPS atau localhost.",
        )
      }
    }

    void startScanner()

    return () => {
      active = false

      const cleanupScanner = async () => {
        try {
          if (scanner.isScanning) {
            await scanner.stop()
          }
        } catch (error) {
          console.error("Gagal menghentikan scanner:", error)
        }

        try {
          scanner.clear()
        } catch (error) {
          console.error("Gagal membersihkan scanner:", error)
        }
      }

      void cleanupScanner()
    }
  }, [navigate, retryKey])

  const handleRetry = () => {
    setError("")
    setCameraError(false)
    setScanning(false)
    setVerifying(false)
    setRetryKey((current) => current + 1)
  }

  return (
    <main className='min-h-screen bg-[#F3F7FF] px-4 py-6 pb-24 sm:px-6'>
      <div className='mx-auto max-w-lg space-y-6'>
        {/* Tombol kembali */}
        <Button
          type='button'
          variant='ghost'
          className='-ml-2 rounded-xl text-slate-600 hover:bg-white'
          onClick={() => navigate("/")}
          disabled={verifying}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Kembali ke Beranda
        </Button>

        {/* Header */}
        <section>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#4F8FEF]'>
              <ScanLine className='h-6 w-6' />
            </div>

            <div>
              <p className='text-sm font-semibold text-[#4F8FEF]'>
                CarWash Check-in
              </p>

              <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
                Scan QR Outlet
              </h1>
            </div>
          </div>

          <p className='text-sm leading-6 text-slate-600'>
            Arahkan kamera ke QR code resmi yang tersedia di outlet untuk
            melanjutkan pemesanan cuci kendaraan.
          </p>
        </section>

        {/* Scanner */}
        <section className='overflow-hidden rounded-3xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5'>
          {/* Status kamera */}
          <div className='mb-4 flex items-center justify-between gap-3'>
            <div>
              <h2 className='font-semibold text-slate-900'>Pemindai QR</h2>

              <p className='mt-1 text-xs text-slate-500'>
                Gunakan kamera belakang HP.
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                verifying
                  ? "bg-amber-50 text-amber-700"
                  : scanning
                    ? "bg-emerald-50 text-emerald-700"
                    : cameraError
                      ? "bg-red-50 text-red-700"
                      : "bg-blue-50 text-blue-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  verifying
                    ? "bg-amber-500"
                    : scanning
                      ? "animate-pulse bg-emerald-500"
                      : cameraError
                        ? "bg-red-500"
                        : "bg-blue-500"
                }`}
              />

              {verifying
                ? "Memverifikasi"
                : scanning
                  ? "Kamera aktif"
                  : cameraError
                    ? "Kamera bermasalah"
                    : "Menyiapkan"}
            </span>
          </div>

          {/* Area kamera */}
          <div className='relative overflow-hidden rounded-2xl bg-slate-950'>
            <div
              id='carwash-qr-reader'
              className='min-h-[300px] w-full overflow-hidden'
            />

            {/* Bingkai scan */}
            {scanning && !verifying && (
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                <div className='relative h-[220px] w-[220px] max-w-[75%]'>
                  <span className='absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-blue-400' />

                  <span className='absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-blue-400' />

                  <span className='absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-blue-400' />

                  <span className='absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-blue-400' />
                </div>
              </div>
            )}

            {/* Overlay verifikasi */}
            {verifying && (
              <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/85 p-6 text-center text-white'>
                <Loader2 className='h-10 w-10 animate-spin text-blue-400' />

                <h3 className='font-semibold'>Memverifikasi QR outlet</h3>

                <p className='text-sm text-slate-300'>
                  Tunggu sebentar, kami sedang memeriksa kode QR.
                </p>
              </div>
            )}

            {/* Overlay error kamera */}
            {cameraError && (
              <div className='absolute inset-0 flex flex-col items-center justify-center bg-slate-950 px-6 py-10 text-center text-white'>
                <Camera className='mb-4 h-12 w-12 text-slate-400' />

                <h3 className='font-semibold'>Kamera belum tersedia</h3>

                <p className='mt-2 text-sm leading-6 text-slate-300'>
                  Izinkan akses kamera di browser, kemudian coba jalankan
                  pemindai kembali.
                </p>
              </div>
            )}
          </div>

          {/* Instruksi */}
          {scanning && !verifying && (
            <div className='mt-4 flex items-start gap-3 rounded-xl bg-blue-50 p-3'>
              <Camera className='mt-0.5 h-5 w-5 shrink-0 text-[#4F8FEF]' />

              <p className='text-sm leading-5 text-blue-900'>
                Posisikan QR code di dalam bingkai. Pastikan gambar tidak buram
                dan pencahayaan cukup.
              </p>
            </div>
          )}

          {/* Error QR atau kamera */}
          {error && (
            <div
              role='alert'
              className='mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3'
            >
              <CircleAlert className='mt-0.5 h-5 w-5 shrink-0 text-red-600' />

              <p className='text-sm leading-6 text-red-700'>{error}</p>
            </div>
          )}

          {/* Tombol coba lagi */}
          {(cameraError || error) && !verifying && (
            <Button
              type='button'
              className='mt-4 h-12 w-full rounded-xl bg-[#4F8FEF] font-semibold hover:bg-blue-600'
              onClick={handleRetry}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Coba Scan Lagi
            </Button>
          )}
        </section>

        {/* Panduan */}
        <section className='rounded-2xl border border-blue-100 bg-white p-4 shadow-sm'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4F8FEF]'>
              <ShieldCheck className='h-5 w-5' />
            </div>

            <div>
              <h2 className='font-semibold text-slate-900'>Sebelum memesan</h2>

              <p className='mt-1 text-sm leading-6 text-slate-600'>
                Pastikan kamu sudah berada di outlet dan memindai QR resmi
                CarWash. Setelah QR berhasil diverifikasi, kamu akan diarahkan
                ke halaman pembuatan pesanan.
              </p>
            </div>
          </div>

          <div className='mt-4 flex items-start gap-2 border-t border-slate-100 pt-4'>
            <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-600' />

            <p className='text-xs leading-5 text-slate-500'>
              Demi keamanan, hanya QR outlet yang lolos verifikasi backend yang
              dapat digunakan untuk melanjutkan order.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
