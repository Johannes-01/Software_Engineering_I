"use client"

import React, { useState } from 'react';
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Trash } from "lucide-react";
import { Item } from "@type/item";

interface GalleryCardProps {
    image: Item;
    deleteCard: (imageId: number) => void;
}

const TopicCard: React.FC<GalleryCardProps> = ({
    image,
    deleteCard,
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
                                        deleteCard(image.id)
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

                        <h2 className="text-xl font-semibold flex gap-2 mb-1">
                            {image.title}
                        </h2>
                        <p className="text-gray-600">{image.notice}</p>
                    </div>
                </CardContent>
            </Card>
    );
};

export default TopicCard;
