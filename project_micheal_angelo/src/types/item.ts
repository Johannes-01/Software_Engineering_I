import { Category } from "./category";

export interface Item {
    category_id: Category;
    title: string;
    artist: string;
    width: number;
    height: number;
    motive_width?: number;
    motive_height?: number;
    price: number;
    notice: string;
}
