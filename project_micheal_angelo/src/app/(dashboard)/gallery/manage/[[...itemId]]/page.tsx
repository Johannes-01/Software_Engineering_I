'use client';

import React, { useEffect, useState } from 'react';
import useSWR from "swr/immutable";
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Textarea } from "@components/ui/textarea"
import {
    Select,
    SelectContent, SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select"
import { cn } from "@utils/tailwind-merge-styles";
import { ItemRequest } from '@type/item'
import { Category } from '@type/category';
import { useRouter } from "next/navigation";

export default function ManageArtwork({ params }: { params: { itemId: string[] } }) {
    const imageId = params.itemId ? params.itemId[0] : undefined
    const router = useRouter()

    const [file, setFile] = useState<File | string | undefined>(undefined);
    const [formData, setFormData] = useState<ItemRequest>({
        title: '',
        notice: '',
        artist: '',
        width: 0,
        height: 0,
        motive_height: 0,
        motive_width: 0,
        price: 0,
        category_id: 0,
    });
    const [ImageStoragePath, setImageStoragePath] = useState<string | undefined>();
    const { data: categories } = useSWR("/api/category", async (url: string) => {
        return await (await fetch(url)).json()
    })

    useSWR(imageId !== undefined ? `/api/image/${imageId}` : null, async (url: string) => {
        const response = await (await fetch(url)).json()
        setFormData({
            title: response.title,
            notice: response.notice,
            artist: response.artist,
            width: response.width,
            height: response.height,
            motive_height: response.motive_height,
            motive_width: response.motive_width,
            price: response.price,
            category_id: response.category_id,
        })
        setFile(response.image_path)
    })

    useEffect(() => {
        if (typeof file === 'string') {
            const imageStoragePath = file.substring(file.lastIndexOf('/') + 1);
            setImageStoragePath(imageStoragePath);
        }
    }, [file]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const onDrop = (acceptedFiles: File[]) => {
        setFile(acceptedFiles[0]);
    }

    const {
        getRootProps,
        getInputProps,
        isDragActive
    } = useDropzone({
        onDrop,
        accept: { 'image/*': [] }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {
            name,
            value
        } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSelectCategory = (value: number) => {
        setFormData(prev => ({
            ...prev,
            category_id: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try
        {
            if(!imageId)
                {
                    if (!file) {
                        setError("Please upload an artwork");
                        return;
                    }

                    uploadItemWithFile(formData, file as File).then(() => {
                        router.push("/gallery")
                    });
                }
                else
                {
                    if(file instanceof File){
                        updateItemWithFile(formData, file).then(() => {
                            router.push("/gallery")
                        })
                    }

                    if(typeof file === 'string'){
                        updateItem(formData).then(() => {
                            router.push("/gallery")
                        })
                    }
                }
        } catch (error) {
            setLoading(false);
            setError("Something went wrong. Please try again.")
        }
    }

    async function uploadItemWithFile(
        item: ItemRequest,
        file: File
    ) {
        const formData = new FormData();
        formData.append('file', file);

        formData.append('itemData', JSON.stringify({
            category_id: item.category_id,
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

    async function updateItem(item: ItemRequest) {
        const payload =  JSON.stringify({
            category_id: item.category_id,
            title: item.title,
            artist: item.artist,
            width: item.width.toString(),
            height: item.height.toString(),
            price: item.price.toString(),
            motive_width: item.motive_width.toString(),
            motive_height: item.motive_width.toString(),
            notice: item.notice,
            image_path: ImageStoragePath
        });

        const response = await fetch(`/api/image/${imageId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Success:', response.json());
        } else {
            setError('Failed to update artwork. Please try again.');
        }
    }

    async function updateItemWithFile(
        item: ItemRequest,
        file: File
    ) {
        const formData = new FormData();
        formData.append('file', file);

        formData.append('itemData', JSON.stringify({
            category_id: item.category_id,
            title: item.title,
            artist: item.artist,
            width: item.width.toString(),
            height: item.height.toString(),
            price: item.price.toString(),
            motive_width: item.motive_width!.toString(),
            motive_height: item.motive_width!.toString(),
            notice: item.notice,
            image_path: ImageStoragePath
        }));

        const response = await fetch(`/api/image/${imageId}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            console.log('Success:', response.json());
        } else {
            setError('Failed to update artwork. Please try again.');
        }
    }

    if (!categories) {
        return null
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="flex flex-col md:flex-row flex-grow p-6 gap-6">
                <div className="w-full md:w-1/2 flex flex-col">
                    <div
                        {...getRootProps()}
                        className={`flex items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer ${isDragActive
                            ? 'border-primary'
                            : 'border-border'
                        }`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={typeof file === "string" ? file : URL.createObjectURL(file)}
                                alt="Uploaded artwork"
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400"/>
                                <p className="mt-2 text-sm text-gray-500">
                                    Drag &apos;n&apos; drop artwork here, or click to select
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="title">Titel</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="notice">Beschreibung</Label>
                            <Textarea
                                id="notice"
                                name="notice"
                                value={formData.notice}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="artist">Künstler</Label>
                            <Input
                                id="artist"
                                name="artist"
                                type="text"
                                value={formData.artist}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <Label htmlFor="width">Äußere Breite</Label>
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
                                <Label htmlFor="height">Äußere Höhe</Label>
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
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <Label htmlFor="width">Motiv Breite</Label>
                                <Input
                                    id="motive_width"
                                    name="motive_width"
                                    type="number"
                                    value={formData.motive_width}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="w-1/2">
                                <Label htmlFor="height">Motiv Höhe</Label>
                                <Input
                                    id="motive_height"
                                    name="motive_height"
                                    type="number"
                                    value={formData.motive_height}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="price">Preis</Label>
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
                            <Label htmlFor="category_id">Kategorie</Label>
                            <Select
                                onValueChange={(value: string) => handleSelectCategory(Number(value))}
                                >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category: Category) =>
                                    <SelectItem
                                        value={category.id.toString()}
                                        key={category.id}
                                    >
                                        {category.name}
                                    </SelectItem>)}
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
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                            </div>
                        ) : (
                            <Button
                                type="submit"
                                className="w-full"
                            >
                                {imageId ? "Artwork aktualisieren" : "Artwork erstellen"}
                            </Button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}