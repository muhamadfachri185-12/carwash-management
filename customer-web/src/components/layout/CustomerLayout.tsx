import { Outlet } from "react-router-dom";
import CustomerHeader from "./CustomerHeader";
import CustomerBottomNav from "./CustomerBottomNav";
function CustomerLayout(){
    return (
      <div className='min-h-screen bg-gray-50'>
        <CustomerHeader />
        <main className="mx-auto max-w-md pb-20">
          <Outlet />
        </main>
        <CustomerBottomNav />
      </div>
    )
}

export default CustomerLayout