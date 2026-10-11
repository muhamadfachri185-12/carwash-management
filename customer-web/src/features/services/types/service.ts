export type Service = {
    id: number
    name: string
    duration: number
    price: number | string
    isActive: boolean
    createdAt: string
}

export type GetServicesResponse = {
    services: Service[]
}