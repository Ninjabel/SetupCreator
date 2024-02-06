export interface Category {
    id: string
    name: string
    products: Part[]
}

export interface Part {
    id: string
    name: string
    categoryId: string
    setupId?: string
    ceneoId: string
    price?: number
    photoUrl: string
    shopUrl?: string
    shopImage?: string
    isPromoted: boolean
}


export interface Setup {
    id: string
    name: string
    userId: string
    products: Part[]
}
