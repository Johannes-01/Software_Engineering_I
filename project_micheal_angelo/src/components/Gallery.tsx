'use client';

import React from 'react'
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Item } from "../types/item";
import { Category } from '../types/category';

export default function Gallery() {
  const [items, setItems] = React.useState<Item[] | undefined>();
  const [currentPage, setCurrentPage] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(0);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = React.useState('')
  const [artist, setArtist] = React.useState("")

  const [availableCategories, setAvailableCategories] = React.useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState<number>(0);

  const fetchImages = async (page?: number, title?: string, category?: number, artist?: string) => {
    try {
      const url = new URL("/api/image", window.location.origin);
      if (page === 0 || page) {
        url.searchParams.set('p', page.toString());
        setCurrentPage(page);
      }
      if (title) url.searchParams.set('q', title);
      if (artist) url.searchParams.set('a', artist);
      if (category) url.searchParams.set('c', category.toString());

      const request: RequestInit = {
        method: 'GET',
      };

      const imageResponse = await fetch(url, request);
      if (!imageResponse.ok) {
        throw new Error("Could not fetch images.");
      }

      const response = await imageResponse.json();

      setItemCount(response.maxCount);
      setItems(response.images);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await fetch("/api/category", {
        method: 'GET'
      });

      if (!categoriesResponse.ok) {
        throw new Error("Could not fetch categories.");
      }

      const categories = await categoriesResponse.json();
      const allCategories: Category[] = [
        ...categories,
      ];

      setAvailableCategories(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  React.useEffect(() => {
    void fetchImages();
    void fetchCategories();
  }, []);

  React.useEffect(() => {
    void fetchImages(currentPage, '', categoryFilter);
  }, [currentPage, categoryFilter]);

  const totalPages = Math.ceil(itemCount / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gallery</h1>
        <div className="flex gap-4 mb-4 w-full">
          <div className='w-[80%] flex-row flex gap-2'>
            <Input
              placeholder="Search artworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Input
                placeholder={"Search for artist..."}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className={"flex-1"}
            />
          </div>
          <div className='w-[15%]'>
            <Select onValueChange={(value: string) => {
              const id = Number(value);
              const selectedCategory = availableCategories.find(category => category.id === id);
              setCategoryFilter(selectedCategory?.id ?? 0);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={0} value="all">All Categories</SelectItem>
                {Object.entries(availableCategories)
                  .map(([, value]) => (
                    <SelectItem
                      key={value.id}
                      value={value.id.toString()}
                    >
                      {String(value.name).charAt(0).toLocaleUpperCase() + String(value.name).slice(1)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className='w-[5%]'>
            <Button
              className='w-full'
              onClick={() => {
                void fetchImages(0, searchTerm, categoryFilter, artist);
              }}
            >
              Search
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items !== undefined && items.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                {/*eslint-disable-next-line @next/next/no-img-element*/}
                <img
                  src={image.image_path}
                  alt={image.title}
                  width={300}
                  height={400}
                  className="w-full h-48 object-cover mb-2"
                />
                <h2 className="text-xl font-semibold">{image.title}</h2>
                <p className="text-gray-600">{image.notice}</p>
                <div className='flex flex-row mt-2 justify-between'>
                  <p className="text-l font-semibold self-center">${image.price.toFixed(2)}</p>
                  <Button>Konfigurieren</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
      {currentPage !== totalPages && (
        <div className="flex justify-center mt-4 w-full mb-8">
          <Button
            className='bg-white text-black hover:bg-white outline-1 hover:outline m-1'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            {"< Previous"}
          </Button>
          {[...Array(totalPages)].map((_, index) => (
            <Button
              variant={'outline'}
              key={index}
              onClick={() => handlePageChange(index)}
              className={currentPage === index ? 'bg-white hover:bg-white text-black outline outline-1 m-1' : 'bg-white hover:bg-white text-black outline-1 hover:outline m-1'}
            >
              {index + 1}
            </Button>
          ))}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className='bg-white text-black hover:bg-white outline-1 hover:outline m-1'
          >
            {"Next >"}
          </Button>
        </div>
      )}
    </div>
  )
}