import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export interface NewVehicleFormData {
    plateNumber: string
    brand: string
    model: string
}

interface NewVehicleFormProps {
    value: NewVehicleFormData
    onChange: (
        field: keyof NewVehicleFormData,
        value: string
    ) => void
    onCancel: () => void
}

export default function NewVehicleForm ({
    value, 
    onChange,
    onCancel
}: NewVehicleFormProps) {
    return (
      <Card>
        <CardContent className='space-y-4 p-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Nomor Polisi</label>

            <Input
              value={value.plateNumber}
              onChange={(event) => onChange("plateNumber", event.target.value)}
              placeholder='B 1234 ABC'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Merek</label>

            <Input
              value={value.brand}
              onChange={(event) => onChange("brand", event.target.value)}
              placeholder='Toyota'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Model</label>

            <Input
              value={value.model}
              onChange={(event) => onChange("model", event.target.value)}
              placeholder='Avanza'
            />
          </div>

          <Button
            type='button'
            variant='ghost'
            className='w-full'
            onClick={onCancel}
          >
            Batal
          </Button>
        </CardContent>
      </Card>
    )
}