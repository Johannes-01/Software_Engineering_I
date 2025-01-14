'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from "swr";
import SelectionCard from "./_local/selection-card";
import { Button } from "@components/ui/button";

export default function Page() {
    const { userId } = useParams<{ userId: string }>();

    const [hoveredCard, setHoveredCard] = useState<string | undefined>(undefined)

    const { data: images } = useSWR(`/api/users/${userId}`, async (url: string) => {
        return await (await fetch(url)).json()
    })

    if (!images) {
        return null;
    }

    const totalCost: number = images.reduce((total: number, image: any) => {
        return total + image.image.price
    }, 0)

    return (
        <div className="p-6">
            <div className={"flex w-full justify-between mb-6"}>
                <h3 className="font-bold text-3xl">Gesamt: {totalCost.toFixed(2)}€</h3>
                <Button>
                    Termin vereinbaren
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.map((image: any) => {
                    return <SelectionCard
                        key={image.id}
                        image={image.image}
                        userId={userId}
                    />
                })}
            </div>
        </div>
    )
};
