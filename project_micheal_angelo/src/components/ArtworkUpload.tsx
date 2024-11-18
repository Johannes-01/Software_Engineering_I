"use client"

import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Check, ChevronsUpDown, Upload, X } from 'lucide-react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import { cn } from "@utils/tailwind-merge-styles";
import Image from 'next/image'

const artists = [
  "Pablo Picasso",
  "Vincent van Gogh",
  "Leonardo da Vinci",
  "Claude Monet",
  "Frida Kahlo",
]

export default function ArtworkUpload() {
  const [file, setFile] = useState<File | null>(null)

  /*
    category_id: number;
  title: string;
  artist_id: string;
  motive_height: number;
  motive_width: number;
  height: number;
  width: number;
  price: number;
  notice?: string;
  image_id: string;
  image_type: string;
  */
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist: '',
    width: '',
    height: '',
    price: '',
    category: ''
  })
  const [open, setOpen] = useState(false)

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': []} })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      // todo handle error (e.g., show error message --> no artwork uploaded)
      return;
    }

    fetch('/api/image', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // todo handle success (e.g., redirect or show success message)
    })
    .catch((error) => {
      console.error('Error:', error);
      // todo handle error (e.g., show error message)
    });
    
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex justify-end p-4">
        <Button variant="ghost" size="icon">
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex flex-col md:flex-row flex-grow p-6 gap-6">
        <div className="w-full md:w-1/2 flex flex-col">
          <div
            {...getRootProps()}
            className={`flex items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer ${
              isDragActive ? 'border-primary' : 'border-border'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <Image
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="artist">Artist</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
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
                            setOpen(false)
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
              </Popover>
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
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value : string)=> handleSelectChange('category', value)} value={formData.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="sculpture">Sculpture</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="digital">Digital Art</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Create Artwork</Button>
          </form>
        </div>
      </div>
    </div>
  )
}