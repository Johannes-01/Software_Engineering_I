"use client"

import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { cn } from "@utils/tailwind-merge-styles";
import { ItemRequest } from '../types/item'
import { Category } from '../types/category'
import { fromDoubleWithTwoDecimalInt } from '../utils/numberExtension'

// if we want to fetch artists later on
/*const artists = [
  "Pablo Picasso",
  "Vincent van Gogh",
  "Leonardo da Vinci",
  "Claude Monet",
  "Frida Kahlo",
]*/

export default function ArtworkUpload() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [formData, setFormData] = useState<ItemRequest>({
    title: '',
    notice: '',
    artist: '',
    width: 0,
    height: 0,
    price: 0,
    category: { id: 0, name: "All"},
  });

  // const [artistsOpen, setArtistsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  /*const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }*/

  const handleSelectCategory = (category: Category) => {
    setFormData(prev => ({ ...prev, category: category }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    formData.price = fromDoubleWithTwoDecimalInt(formData.price);
    formData.height = fromDoubleWithTwoDecimalInt(formData.height);
    formData.width = fromDoubleWithTwoDecimalInt(formData.width);

    // todo do we need to have both? --> simon?
    formData.motive_height = formData.height;
    formData.motive_width = formData.width;

    if (!file) {
      setError("Please upload an artwork");
      return;
    }

    uploadItemWithFile(formData, file).then(() => {
      setLoading(false);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function uploadItem(item: ItemRequest) {
    const payload = {
      ...item,
      // Exclude the File from the JSON payload
      image: undefined
    }

    const response = await fetch('/api/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      console.log('Success:', response.json());
    } else {
      setError('Failed to upload artwork. Please try again.');
    }
  }

  async function uploadItemWithFile(item: ItemRequest, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    formData.append('itemData', JSON.stringify({
      category: item.category.toString(),
      title: item.title,
      artist: item.artist,
      width: item.width.toString(),
      height: item.height.toString(),
      price: item.price.toString(),
      motive_width: item.motive_width!.toString(),
      motive_height: item.motive_width!.toString(),
      notice: item.notice,
    }));

    const response = await fetch('/api/image', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      console.log('Success:', response.json());
    } else {
      setError('Failed to upload artwork. Please try again.');
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-col md:flex-row flex-grow p-6 gap-6">
        <div className="w-full md:w-1/2 flex flex-col">
          <div
            {...getRootProps()}
            className={`flex items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary' : 'border-border'
              }`}
          >
            <input {...getInputProps()} />
            {file ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(file)}
                alt="Uploaded artwork"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Drag &apos;n&apos; drop artwork here, or click to select
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="notice">Description</Label>
              <Textarea
                id="notice"
                name="notice"
                value={formData.notice}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                name="artist"
                type="text"
                value={formData.artist}
                onChange={handleInputChange}
                required
              />
              {/* <Popover open={artistsOpen} onOpenChange={setArtistsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={artistsOpen}
                    className="w-full justify-between"
                  >
                    {formData.artist || "Select artist..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search artist..." />
                    <CommandEmpty>No artist found.</CommandEmpty>
                    <CommandGroup>
                      {artists.map((artist) => (
                        <CommandItem
                          key={artist}
                          onSelect={() => {
                            handleSelectChange('artist', artist)
                            setArtistsOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.artist === artist ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {artist}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover> */}
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  name="width"
                  type="number"
                  value={formData.width}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select onValueChange={(value: string) => handleSelectCategory(value as unknown as Category)} value={formData.category.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {/**todo fetch an map categories */}
                  {/* <SelectItem value={Category.original.toString()}>Original</SelectItem>
                  <SelectItem value={Category.replica.toString()}>Reproduktion</SelectItem>
                  <SelectItem value={Category.grafic.toString()}>Grafik</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className='text-[red] text-center'>
                {error}
              </p>
            )}
            {loading ? (
              <div className='flex justify-center items-center'>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn("animate-spin")}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            ) : (
              <Button type="submit" className="w-full">Create Artwork</Button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}