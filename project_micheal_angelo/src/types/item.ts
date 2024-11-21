import { Category } from "./category";

export interface Item {
    id: number;
    category: Category;
    title: string;
    artist: string;
    width: number;
    height: number;
    motive_width?: number;
    motive_height?: number;
    price: number;
    notice: string;
}

export interface ItemRequest {
    category: Category;
    title: string;
    artist: string;
    width: number;
    height: number;
    motive_width?: number;
    motive_height?: number;
    price: number;
    notice: string;   
}
