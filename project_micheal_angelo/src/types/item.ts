import { Category } from "@/types/category";

export interface Item {
    category: Category;
    title: string;
    artist: string;
    artistId: number;
    sheetWidth: number;
    sheetHeight: number;
    imageWidth: number;
    imageHeight: number;
    price: number;
    note: string;
    imageUrl: string;
}
