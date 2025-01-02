import { Category as string } from "./category";

export interface Item {
    id: number;
    category_id: number;
    title: string;
    artist: string;
    width: number;
    height: number;
    motive_width?: number;
    motive_height?: number;
    price: number;
    notice: string;
    image_path: string;
}

export interface ItemRequest {
    category_id: number;
    title: string;
    artist: string;
    width: number;
    height: number;
    motive_width?: number;
    motive_height?: number;
    price: number;
    notice: string;   
}
