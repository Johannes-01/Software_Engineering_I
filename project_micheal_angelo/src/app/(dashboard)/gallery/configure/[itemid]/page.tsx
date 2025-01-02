'use client';

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import React, { useState } from "react";
import useSWR from "swr";
import { Item } from "@type/item"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Heart } from "lucide-react";
import { Label } from "@components/ui/label";

interface ConfigurationOptions {
    pallet: string[]
    strip: string[]
}

export default function ConfigureArtworkPage() {
    const { itemid } = useParams();
    const searchParams = useSearchParams()
    const router = useRouter()

    const [pallet, setPallet] = useState<string | undefined>(undefined)
    const [strip, setStrip] = useState<string | undefined>(undefined)
    const [passepartout, setPassepartout] = useState<boolean>(false)

    const { data: image } = useSWR<Item>(`/api/image/${itemid}`, async (url: string) => {
        return await (await fetch(url)).json()
    })

    const { data: configurationOptions } = useSWR<ConfigurationOptions>("/api/image/configure", async (url: string) => {
        return await (await fetch(url)).json()
    })

    const { data: categories } = useSWR("/api/category", async (url: string) => {
        return await (await fetch(url)).json()
    })

    const userId = searchParams.get("userId")

    if (!image || !configurationOptions || !categories) {
        return null
    }

    // eslint-ignore-next-line
    const category = categories.find((category: any) => category.id === image.category_id)

    return (
        <div className={"flex flex-col p-6 gap-12"}>
            <h1 className={"text-2xl font-semibold"}>Bildkonfigurator</h1>
            <div className={"flex"}>
                <img src={image.image_path} className={"w-1/2"}/>
                <div className={"flex flex-col w-1/2 gap-4"}>
                    <div>
                        <h2 className={"text-3xl font-bold"}>{image.title}</h2>
                        <p>{image.notice}</p>
                        <small>von {image.artist}</small>
                    </div>
                    <hr/>
                    <div>
                        <p>Kategorie: {category.name}</p>
                        <p>Preis: {(image.price / 100).toFixed(2)}€</p>
                    </div>
                    <hr/>
                    <div>
                        <Label htmlFor={"pallet"} className={"mb-2"}>Zierleiste</Label>
                        <Select name={"pallet"} onValueChange={(value: string) => {
                            if (value === "no") {
                                setPallet(undefined)
                            }

                            setPallet(value)
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Keine Zierleiste"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key={0} value={"no"}>Keine Zierleiste</SelectItem>
                                {configurationOptions.pallet.map((option: string) => (
                                    <SelectItem
                                        key={option}
                                        value={option}
                                    >
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor={"passepartout"} className={"mb-2"}>Passepartout</Label>
                        <Select name={"passepartout"} onValueChange={(value: string) => {
                            if (value === "no") {
                                setPassepartout(false)
                            }

                            setPassepartout(true)
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Kein Passepartout"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key={0} value={"false"}>Kein Passepartout</SelectItem>
                                <SelectItem key={1} value={"yes"}>Passepartout</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor={"strip"} className={"mb-2"}>Rahmen</Label>
                        <Select name={"strip"} onValueChange={(value: string) => {
                            if (value === "no") {
                                setStrip(undefined)
                            }

                            setStrip(value)
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Kein Rahmen"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key={0} value={"no"}>Kein Rahmen</SelectItem>
                                {configurationOptions.strip.map((option: string) => (
                                    <SelectItem
                                        key={option}
                                        value={option}
                                    >
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className={"flex flex-row-reverse"}>
                <Button onClick={() => {
                    (async () => {
                        fetch(`/api/image/configure/${userId}`, {
                            method: "POST",
                            body: JSON.stringify({
                                strip: strip ?? null,
                                pallet: pallet ?? null,
                                passepartout,
                                imageId: itemid
                            })
                        })
                            .then(() => router.back())
                    })()
                }}><Heart/>Zur Auswahlmappe hinzufügen</Button>
            </div>
        </div>
    );
}