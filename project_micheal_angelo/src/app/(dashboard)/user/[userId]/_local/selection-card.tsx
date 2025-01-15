import React, { useState } from 'react';
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Edit2, Trash } from "lucide-react";
import { Item } from "@type/item";
import Link from "next/link";

interface GalleryCardProps {
    image: Item;
    userId: string | undefined;
    deleteCard: (imageId: number) => void;
    configId: number
}

const GalleryCard: React.FC<GalleryCardProps> = ({
    image,
    userId,
    deleteCard,
    configId,
}) => {
    const [isHovered, setIsHovered] = useState<boolean>(false)

    return (
        <Card
            className="relative"
            key={image.id}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent className="p-4 flex flex-col justify-between h-full">
                <div>
                    {(isHovered) && (
                        <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => {
                                    deleteCard(configId)
                                }}
                            >
                                <Trash className="text-white"/>
                            </Button>
                        </div>
                    )}

                    <img
                        src={image.image_path}
                        alt={image.title}
                        width={300}
                        height={400}
                        className="w-full h-48 object-cover mb-2 rounded"
                    />

                    <h2 className="text-xl font-semibold">{image.title}</h2>
                    <p className="text-gray-600">{image.notice}</p>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <p className="text-lg font-semibold">${image.price.toFixed(2)}</p>
                    {
                        userId
                            ? <Link href={`/gallery/configure/${image.id}?userId=${userId}&configId=${configId}`}>
                                <Button>
                                    Editieren
                                </Button>
                            </Link>
                            : <Button disabled={true}>
                                Editieren
                            </Button>
                    }
                </div>
            </CardContent>
        </Card>
    );
};

export default GalleryCard;
