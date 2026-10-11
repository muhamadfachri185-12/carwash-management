import WelcomeSection from "@/components/home/WelcomeSection"
import ScanQrCard from "@/components/home/ScanQrCard"
import ActiveOrderCard from "@/components/home/ActiveOrderCard"
import VehicleSection from "@/components/home/VehicleSection"
import ServicePreview from "@/components/home/ServicePreview"

function HomePage() {
  return (
    <div className='mx-auto w-full max-w-[430px] space-y-6 bg-[#F3F7FF] px-4 py-6'>
      <WelcomeSection />
      <ScanQrCard />
      <ActiveOrderCard />
      <VehicleSection />
      <ServicePreview />
    </div>
  )
}

export default HomePage
