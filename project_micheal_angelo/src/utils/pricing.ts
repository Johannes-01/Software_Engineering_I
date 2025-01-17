import { Item } from "@type/item";

interface Image {
    image: Item
    pallet: string
}

// returns price in format of 100.00 if value passed is 10000
export const calculatePrice = (image: Image) => {
    return (image.image.price + (image.pallet ? image.image.price * 0.15 : 0)) / 100
}