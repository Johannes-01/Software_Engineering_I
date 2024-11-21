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
} from "./ui/select"
import { Item } from "../types/item";
import { Category } from '../types/category';

// Mock data for demonstration
const images: Array<Item & { imageUrl: string }> = [
  { id: 1, width: 0, height: 0, title: 'Artwork Title 1', artist: 'John Doe', category: Category.original, notice: 'A short description of the artwork. This piece showcases...', price: 100, imageUrl: 'https://kvhaquacaxdwniozpuhq.supabase.co/storage/v1/object/sign/images/056c37d8-99db-41c5-8a01-9b1668b683ca?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvMDU2YzM3ZDgtOTlkYi00MWM1LThhMDEtOWIxNjY4YjY4M2NhIiwiaWF0IjoxNzMyMjA5NTQ2LCJleHAiOjE3MzI4MTQzNDZ9.Uzsb_oFwE-x031r9I56V_NCwKCrqxudPdtIZpuwfpsc&t=2024-11-21T17%3A19%3A06.633Z' },
  { id: 2, width: 0, height: 0, title: 'Artwork Title 2', artist: 'Jane Smith', category: Category.replica, notice: 'A short description of the artwork. This piece showcases...', price: 200, imageUrl: '/placeholder.svg' },
  { id: 3, width: 0, height: 0, title: 'Artwork Title 3', artist: 'Bob Johnson', category: Category.grafic, notice: 'A short description of the artwork. This piece showcases...', price: 300, imageUrl: '/placeholder.svg' },
  { id: 4, width: 0, height: 0, title: 'Artwork Title 4', artist: 'Alice Brown', category: Category.original, notice: 'A short description of the artwork. This piece showcases...', price: 400, imageUrl: '/placeholder.svg' },
  { id: 5, width: 0, height: 0, title: 'Artwork Title 5', artist: 'Charlie Green', category: Category.replica, notice: 'A short description of the artwork. This piece showcases...', price: 500, imageUrl: '/placeholder.svg' },
  { id: 6, width: 0, height: 0, title: 'Artwork Title 6', artist: 'Diana White', category: Category.grafic, notice: 'A short description of the artwork. This piece showcases...', price: 600, imageUrl: '/placeholder.svg' },
  { id: 7, width: 0, height: 0, title: 'Artwork Title 7', artist: 'Diana White', category: Category.grafic, notice: 'A short description of the artwork. This piece showcases...', price: 600, imageUrl: '/placeholder.svg' },
  { id: 1, width: 0, height: 0, title: 'Artwork Title 1', artist: 'John Doe', category: Category.original, notice: 'A short description of the artwork. This piece showcases...', price: 100, imageUrl: 'https://kvhaquacaxdwniozpuhq.supabase.co/storage/v1/object/sign/images/056c37d8-99db-41c5-8a01-9b1668b683ca?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvMDU2YzM3ZDgtOTlkYi00MWM1LThhMDEtOWIxNjY4YjY4M2NhIiwiaWF0IjoxNzMyMjA5NTQ2LCJleHAiOjE3MzI4MTQzNDZ9.Uzsb_oFwE-x031r9I56V_NCwKCrqxudPdtIZpuwfpsc&t=2024-11-21T17%3A19%3A06.633Z' },
  { id: 2, width: 0, height: 0, title: 'Artwork Title 2', artist: 'Jane Smith', category: Category.replica, notice: 'A short description of the artwork. This piece showcases...', price: 200, imageUrl: '/placeholder.svg' },
  { id: 3, width: 0, height: 0, title: 'Artwork Title 3', artist: 'Bob Johnson', category: Category.grafic, notice: 'A short description of the artwork. This piece showcases...', price: 300, imageUrl: '/placeholder.svg' },
  { id: 4, width: 0, height: 0, title: 'Artwork Title 4', artist: 'Alice Brown', category: Category.original, notice: 'A short description of the artwork. This piece showcases...', price: 400, imageUrl: '/placeholder.svg' },
  { id: 5, width: 0, height: 0, title: 'Artwork Title 5', artist: 'Charlie Green', category: Category.replica, notice: 'A short description of the artwork. This piece showcases...', price: 500, imageUrl: '/placeholder.svg' },
  { id: 6, width: 0, height: 0, title: 'Artwork Title 6', artist: 'Diana White', category: Category.grafic, notice: 'A short description of the artwork. This piece showcases...', price: 600, imageUrl: '/placeholder.svg' },
  { id: 7, width: 0, height: 0, title: 'Artwork Title 7', artist: 'Diana White', category: Category.grafic, notice: 'A short description of the artwork. This piece showcases...', price: 600, imageUrl: '/placeholder.svg' },

]

// if we want to fetch artists
// const artists = ['all', 'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Green', 'Diana White']

export default function Gallery() {
  const [filteredImages, setFilteredImages] = React.useState(images)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<Category>(Category.ALL);
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 6
  // const [artistFilter, setArtistFilter] = React.useState('All')

  React.useEffect(() => {
    let result = images
    if (searchTerm) {
      result = result.filter(img =>
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.notice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.artist.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter && categoryFilter !== Category.ALL) {
      result = result.filter(img => img.category === categoryFilter)
    }

    /*if (artistFilter !== 'all') {
      result = result.filter(img => img.artist === artistFilter)
    }*/

    setFilteredImages(result)
  }, [searchTerm, categoryFilter])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredImages.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gallery</h1>
        <div className="flex gap-4 mb-4 w-full">
          <div className='w-[90%]'>
            <Input
              placeholder="Search artworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          {/*<div className='w-[10%]'>
        <Select value={artistFilter} onValueChange={setArtistFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Artist" />
          </SelectTrigger>
          <SelectContent>
            {artists.map((artist) => (
              <SelectItem key={artist} value={artist}>
                {artist}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div> */}
          <div className='w-[10%]'>
            <Select
              value={categoryFilter?.toString()}
              onValueChange={(value: string) => {
                const numValue = value === Category.ALL.toString()
                  ? Category.ALL
                  : Number(value) as Category;
                setCategoryFilter(numValue);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Category.ALL.toString()}>All Categories</SelectItem>
                {Object.values(Category)
                  .filter(category => typeof category === 'number')
                  .map((category) => (
                    <SelectItem key={category} value={category.toString()}>
                      {Category[category]}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentItems.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                {/*eslint-disable-next-line @next/next/no-img-element*/}
                <img
                  src={image.imageUrl}
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
      {filteredImages.length > itemsPerPage && (
        <div className="flex justify-center mt-4 fixed bottom-0 w-full mb-8">
          <Button
            className='bg-white text-black hover:bg-white outline-1 hover:outline m-1'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {"< Previous"}
          </Button>
          {[...Array(totalPages)].map((_, index) => (
            <Button
              variant={'outline'}
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? 'bg-white hover:bg-white text-black outline outline-1 m-1' : 'bg-white hover:bg-white text-black outline-1 hover:outline m-1'}
            >
              {index + 1}
            </Button>
          ))}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='bg-white text-black hover:bg-white outline-1 hover:outline m-1'
          >
            {"Next >"}
          </Button>
        </div>
      )}
    </div>
  )
}