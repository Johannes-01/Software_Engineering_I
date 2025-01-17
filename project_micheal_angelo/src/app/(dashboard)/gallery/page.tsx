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
import { createPortal } from "react-dom";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@components/ui/alert-dialog";

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

    const [deleteArtwork, setDeleteArtwork] = React.useState<number | undefined>(undefined)

    const { data: userInformation } = useSWRImmutable<UserInformation>("api/get-user-information", fetcher);
    const { data: users } = useSWRImmutable<User[]>("api/users", fetcher);

    const { data: imageData, mutate } = useSWR<ImageResponse>(
        imageQuery,
        fetcher,
        { keepPreviousData: true }
    );

    const totalPages = imageData ? Math.ceil(imageData.maxCount / ITEMS_PER_PAGE) : 0;

    const userToAddTo = (() => {
        if (!userInformation) {
            return undefined
        }

        return userInformation.isAdmin
            ? selectedUser?.id
            : userInformation.userId
    })()

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
                        userId={userToAddTo}
                        userIsAdmin={userInformation?.isAdmin}
                        deleteAction={setDeleteArtwork}
                    />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {createPortal(
                <AlertDialog open={!!deleteArtwork}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Wirklich löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Löschen kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteArtwork(undefined)}>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                                fetch(`/api/image/${deleteArtwork}`, {
                                    method: "DELETE"
                                })
                                    .finally(() => {
                                        setDeleteArtwork(undefined)
                                        void mutate()
                                    })
                            }}>Löschen</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>,
                document.body,
            )}
        </div>
    );
}
