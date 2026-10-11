import { Separator } from "@/components/ui/separator"
import type { OrderItem } from "../types/order.types"
import { formatOrderPrice } from "../utils/order.utils"
import { Sparkles } from "lucide-react"

interface OrderItemListProps {
  items: OrderItem[]
}

export default function OrderItemList({ items }: OrderItemListProps) {
  if (items.length === 0) {
    return (
      <p className='rounded-xl bg-[#F3F7FF] p-4 text-center text-sm text-slate-500'>
        Belum ada layanan pada pesanan ini.
      </p>
    )
  }

  return (
    <div className='space-y-3'>
      {items.map((item, index) => (
        <div key={item.id}>
          <div className='flex items-start gap-3'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4F8FEF]'>
              <Sparkles className='size-5' />
            </div>

            <div className='min-w-0 flex-1'>
              <p className='break-words text-sm font-semibold text-slate-800'>
                {item.service.name}
              </p>

              <p className='mt-1 text-xs text-slate-500'>
                {item.quantity} × {formatOrderPrice(item.priceSnapshot)}
              </p>
            </div>

            <p className='shrink-0 text-right text-sm font-semibold text-slate-800'>
              {formatOrderPrice(item.subtotal)}
            </p>
          </div>

          {index < items.length - 1 && (
            <Separator className='mt-3 bg-slate-100' />
          )}
        </div>
      ))}
    </div>
  )
}
