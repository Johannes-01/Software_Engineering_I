'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from "swr";
import SelectionCard from "./_local/selection-card";
import { Button } from "@components/ui/button";
import { createPortal } from "react-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { toast } from "sonner"

export default function Page() {
    const { userId } = useParams<{ userId: string }>();

    const [deleteCard, setDeleteCard] = useState<number | undefined>(undefined)

    const {
        data: images,
        mutate
    } = useSWR(`/api/users/${userId}`, async (url: string) => {
        return await (await fetch(url)).json()
    })

    if (!images) {
        return null;
    }

    const totalCost: number = images.reduce((
        total: number,
        image: any
    ) => {
        return total + image.image.price
    }, 0)

    return (
        <div className="p-6">
            <div className={"flex w-full justify-between mb-6"}>
                <h3 className="font-bold text-3xl">Gesamt: {totalCost.toFixed(2)}€</h3>
                <Button
                    disabled={totalCost < 1}
                    onClick={() => {
                        fetch("/api/whatthecommit")
                            .then(async (response) => await response.json())
                            .then((response) => toast(response.commitMessage))
                    }}
                >
                    Termin vereinbaren
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.map((image: any) => {
                    return <SelectionCard
                        key={image.id}
                        image={image.image}
                        userId={userId}
                        deleteCard={setDeleteCard}
                    />
                })}
            </div>
            {createPortal(
                <Dialog
                    open={!!deleteCard}
                    onOpenChange={(wantsToOpen) => !wantsToOpen && setDeleteCard(undefined)}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Wirklich löschen</DialogTitle>
                            <DialogDescription>
                                Möchtest du dein konfiguriertes Bild wirklich löschen. Damit werden auch Originale
                                wieder
                                für andere Kunden freigegeben
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setDeleteCard(undefined)}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                onClick={() => {
                                    fetch(
                                        `/api/users/${userId}?id=${deleteCard}`,
                                        {
                                            method: "DELETE"
                                        }
                                    )
                                        .finally(() => {
                                            setDeleteCard(undefined)
                                            void mutate()
                                        })
                                }}
                            >
                                Löschen
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>,
                document.body
            )}
        </div>
    )
};
