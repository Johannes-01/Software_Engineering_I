import React, { useState } from 'react';
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Trash } from "lucide-react";
import { Item } from "@type/item";
import Link from "next/link";

interface GalleryCardProps {
    image: { id: number, pallet: string, is_recommendation: boolean, image: Item };
    userId: string | undefined;
    deleteCard: (imageId: number) => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
    image,
    userId,
    deleteCard,
}) => {
    const [isHovered, setIsHovered] = useState<boolean>(false)

    const price = (image.image.price + (image.pallet ? image.image.price * 0.15 : 0)) / 100

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
                                    deleteCard(image.id)
                                }}
                            >
                                <Trash className="text-white"/>
                            </Button>
                        </div>
                    )}

                    <img
                        src={image.image.image_path}
                        alt={image.image.title}
                        width={300}
                        height={400}
                        className="w-full h-48 object-cover mb-2 rounded"
                    />

                    <h2 className="text-xl font-semibold flex gap-2 mb-1">
                        {image.image.title}
                        {image.is_recommendation && <Badge variant={"outline"}>Vorschlag</Badge>}
                    </h2>
                    <p className="text-gray-600">{image.image.notice}</p>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <p className="text-lg font-semibold">${price.toFixed(2)}€</p>
                    {
                        userId
                            ? <Link href={`/gallery/configure/${image.image.id}?userId=${userId}&configId=${image.id}`}>
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
