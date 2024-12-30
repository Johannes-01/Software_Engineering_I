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
import useSWR from "swr";
import { Edit2, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserInformation {
  isAdmin: boolean
  userId: string
}

interface Users {
  id: string
  email: string
}

export default function Gallery() {
  const router = useRouter()
  const [items, setItems] = React.useState<Item[] | undefined>();
  const [currentPage, setCurrentPage] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(0);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = React.useState('')
  const [artist, setArtist] = React.useState("")
  const { data: userInformation } = useSWR<UserInformation>("api/get-user-information", async (url: string) => {
    return await (await fetch(url)).json()
  })
  const { data: users } = useSWR<Users[]>("api/user", async (url: string) => {
    return await (await fetch(url)).json()
  })

  const [availableCategories, setAvailableCategories] = React.useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState<number>(0);
  const [selectedUser, setSelectedUser] = React.useState<Users | undefined>(undefined)
  const [cardHovered, setCardHovered] = React.useState<any | undefined>(undefined)

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
          <div className={"w-full mb-4"}>
            <div className="flex gap-4 mb-2 w-full">
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
                    <SelectValue placeholder="Category"/>
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
            {(!!userInformation && userInformation.isAdmin) && <div className={"w-full flex justify-between"}>
              <div className='w-[15%]'>
                {!!users && <Select onValueChange={(value: string) => {
                  setSelectedUser(users.find(user => user.id === value))
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Kein Nutzer"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key={0} value={"no"}>Kein Nutzer</SelectItem>
                    {users
                        .map((user) => (
                            <SelectItem
                                key={user.id}
                                value={user.id}
                            >
                              {user.email}
                            </SelectItem>
                        ))}
                  </SelectContent>
                </Select>}
              </div>
              <Button onClick={() => {

              }}>HinzufÃ¼gen</Button>
            </div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
            {items !== undefined && items.map((image) => (
                <Card
                    className={"relative"}
                    key={image.id}
                    onMouseEnter={() => setCardHovered(image)}
                    onMouseLeave={() => setCardHovered(undefined)}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                      {
                          (!!cardHovered && cardHovered.id === image.id) &&
                          <div className={"absolute top-2 right-2 flex gap-2"}>
                            <Button variant={"secondary"} onClick={() => {

                            }}>
                              <Edit2/>
                            </Button>
                            <Button className={"bg-red-500 hover:bg-red-600"} onClick={() => {

                            }}>
                              <Trash className={"text-white"}/>
                            </Button>
                          </div>
                      }
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
                    </div>
                    <div className='flex flex-row mt-2 justify-between'>
                      <p className="text-l font-semibold self-center">${image.price.toFixed(2)}</p>
                      <Button
                          disabled={selectedUser === undefined}
                          onClick={() => {
                            router.push(`/gallery/configure/${image.id}?userId=${selectedUser!.id}`)
                          }}
                      >
                        Konfigurieren
                      </Button>
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