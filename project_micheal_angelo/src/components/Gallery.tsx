'use client';

import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Item } from "@type/item";
import { Category } from '@type/category';
import useSWR from "swr";
import { Edit2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserInformation {
    isAdmin: boolean;
    userId: string;
}

interface Users {
    id: string;
    email: string;
}

interface ImageResponse {
    maxCount: number;
    images: Item[];
}

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`An error occurred while fetching the data from ${url}`);
    }
    return response.json();
};

export default function Gallery() {
    const router = useRouter();

    const [searchTerm, setSearchTerm] = React.useState('');
    const [artist, setArtist] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState<number>(0);
    const [selectedUser, setSelectedUser] = React.useState<Users | undefined>(undefined);
    const [cardHovered, setCardHovered] = React.useState<number | undefined>(undefined);

    const [currentPage, setCurrentPage] = React.useState(0);
    const itemsPerPage = 10;

    const { data: userInformation } = useSWR<UserInformation>("api/get-user-information", fetcher);
    const { data: users } = useSWR<Users[]>("api/user", fetcher);
    const { data: availableCategories } = useSWR<Category[]>("/api/category", fetcher);

    const buildImageQuery = () => {
        const params = new URLSearchParams();
        params.append('p', currentPage.toString());
        if (searchTerm) {
            params.append('q', searchTerm);
        }
        if (artist) {
            params.append('a', artist);
        }
        if (categoryFilter !== 0) {
            params.append('c', categoryFilter.toString());
        }
        return `/api/image?${params.toString()}`;
    };

    const { data: imageData } = useSWR<ImageResponse>(
        buildImageQuery(),
        fetcher,
        { keepPreviousData: true }
    );

    const totalPages = imageData ? Math.ceil(imageData.maxCount / itemsPerPage) : 0;

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleCategoryChange = (value: string) => {
        const id = Number(value);
        setCategoryFilter(id);
        setCurrentPage(0); // Reset to first page on filter change
    };

    const handleUserChange = (value: string) => {
        if (value === "no") {
            setSelectedUser(undefined);
        } else {
            const user = users?.find(user => user.id === value);
            setSelectedUser(user);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Gallery</h1>

            <div className="w-full mb-4">
                <div className="flex gap-4 mb-2 w-full">
                    <div className="w-4/5 flex gap-2">
                        <Input
                            placeholder="Search artworks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            placeholder="Search for artist..."
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            className="flex-1"
                        />
                    </div>

                    {/* Category Select */}
                    <div className="w-3/20">
                        <Select onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Category"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">All Categories</SelectItem>
                                {availableCategories?.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id.toString()}
                                    >
                                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-1/20">
                        <Button
                            className="w-full"
                            onClick={() => {
                                setCurrentPage(0);
                            }}
                        >
                            Search
                        </Button>
                    </div>
                </div>

                {userInformation?.isAdmin && (
                    <div className="w-full flex justify-between">
                        <div className="w-3/20">
                            {users && (
                                <Select onValueChange={handleUserChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="No User"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no">No User</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <Button
                            onClick={() => {
                                // Handle adding new item
                                // e.g., router.push('/gallery/add');
                            }}
                        >
                            Add
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {imageData?.images.map((image) => (
                    <Card
                        className="relative"
                        key={image.id}
                        onMouseEnter={() => setCardHovered(image.id)}
                        onMouseLeave={() => setCardHovered(undefined)}
                    >
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div>
                                {/* Hover Actions */}
                                {cardHovered === image.id && (
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                // Handle edit action
                                                // e.g., router.push(`/gallery/edit/${image.id}`);
                                            }}
                                        >
                                            <Edit2/>
                                        </Button>
                                        <Button
                                            className="bg-red-500 hover:bg-red-600"
                                            onClick={() => {
                                                // Handle delete action
                                                // e.g., deleteImage(image.id);
                                            }}
                                        >
                                            <Trash className="text-white"/>
                                        </Button>
                                    </div>
                                )}

                                {/* Image */}
                                <img
                                    src={image.image_path}
                                    alt={image.title}
                                    width={300}
                                    height={400}
                                    className="w-full h-48 object-cover mb-2"
                                />

                                {/* Title and Notice */}
                                <h2 className="text-xl font-semibold">{image.title}</h2>
                                <p className="text-gray-600">{image.notice}</p>
                            </div>

                            {/* Price and Configure Button */}
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-lg font-semibold">${image.price.toFixed(2)}</p>
                                <Button
                                    disabled={!selectedUser}
                                    onClick={() => {
                                        if (selectedUser) {
                                            router.push(`/gallery/configure/${image.id}?userId=${selectedUser.id}`);
                                        }
                                    }}
                                >
                                    Configure
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {imageData && totalPages > 1 && (
                <div className="flex justify-center mt-4 w-full mb-8">
                    <Button
                        className="bg-white text-black hover:bg-white outline-1 hover:outline m-1"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    >
                        {"< Previous"}
                    </Button>
                    {Array.from(
                        { length: totalPages },
                        (
                            _,
                            index
                        ) => (
                            <Button
                                variant="outline"
                                key={index}
                                onClick={() => handlePageChange(index)}
                                className={
                                    currentPage === index
                                        ? 'bg-white hover:bg-white text-black outline outline-1 m-1'
                                        : 'bg-white hover:bg-white text-black outline-1 hover:outline m-1'
                                }
                            >
                                {index + 1}
                            </Button>
                        )
                    )}
                    <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="bg-white text-black hover:bg-white outline-1 hover:outline m-1"
                    >
                        {"Next >"}
                    </Button>
                </div>
            )}
        </div>
    );
}
