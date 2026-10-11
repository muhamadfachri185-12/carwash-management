import LoginForm from "@/features/auth/components/LoginForm"
function LoginPage() {
  return (
    <div className='min-h-screen bg-[#F3F7FF] px-5 py-8 sm:py-12'>
      <main className='mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center'>
        {/* Logo WashFlow */}
        <div className='mb-8 flex items-center justify-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F8FEF] text-2xl text-white shadow-md shadow-blue-200'>
            🚘
          </div>

          <span className='text-2xl font-bold tracking-tight text-slate-900'>
            Washflow
          </span>
        </div>

        {/* Welcome Section */}
        <div className='mb-7 text-center'>
          <div className='mb-4 inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700'>
            Mencuci mobil jauh lebih mudah
          </div>

          <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
            Selamat Datang Kembali
          </h1>

          <p className='mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500'>
            Masuk ke akunmu untuk memesan layanan cuci mobil dan memantau
            pesananmu.
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <p className='mt-6 text-center text-xs leading-5 text-slate-400'>
          Cuci mobil jadi lebih praktis bersama WashFlow.
        </p>
      </main>
    </div>
  )
}

export default LoginPage
