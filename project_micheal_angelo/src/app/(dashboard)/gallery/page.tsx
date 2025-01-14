'use client';

import React, { useState } from 'react';
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { useRouter } from "next/navigation";

import SearchBar from "./_local/search-bar";
import Pagination from "./_local/pagination";
import GalleryCard from "./_local/gallery-card";

import { Item } from "@type/item";
import { Category } from '@type/category';

interface UserInformation {
    isAdmin: boolean;
    userId: string;
}

interface ImageResponse {
    maxCount: number;
    images: Item[];
}

interface User {
    email: string;
    id: string;
}

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`An error occurred while fetching the data from ${url}`);
    }
    return response.json();
};

const ITEMS_PER_PAGE = 10;

export default function Gallery() {
    const [imageQuery, setImageQuery] = useState<string>("/api/image")

    const [selectedUser, setSelectedUser] = React.useState<User | undefined>(undefined);
    const [currentPage, setCurrentPage] = React.useState(0);

    const { data: userInformation } = useSWRImmutable<UserInformation>("api/get-user-information", fetcher);
    const { data: users } = useSWRImmutable<User[]>("api/users", fetcher);

    const { data: imageData } = useSWR<ImageResponse>(
        imageQuery,
        fetcher,
        { keepPreviousData: true }
    );

    const totalPages = imageData ? Math.ceil(imageData.maxCount / ITEMS_PER_PAGE) : 0;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Gallery</h1>

            <div className="w-full mb-4">
                <SearchBar
                    userIsAdmin={userInformation?.isAdmin}
                    setImageQuery={setImageQuery}
                    users={users as any}
                    currentPage={currentPage}
                    setSelectedUser={setSelectedUser}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {imageData?.images.map((image) => (
                    <GalleryCard
                        key={image.id}
                        image={image}
                        userId={(userInformation !== undefined && !userInformation.isAdmin)
                            ? userInformation.userId
                            : selectedUser?.id}
                        userIsAdmin={userInformation?.isAdmin}
                    />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
