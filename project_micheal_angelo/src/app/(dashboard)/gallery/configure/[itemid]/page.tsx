'use client';

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Item } from "@type/item"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Heart } from "lucide-react";
import { Label } from "@components/ui/label";

interface ConfigurationOptions {
    pallet: string[]
    strip: string[]
}

const fetcher = async (url: string) => {
    return await (await fetch(url)).json()
}

export default function ConfigureArtworkPage() {
    const { itemid } = useParams();

    const router = useRouter()

    const searchParams = useSearchParams()
    const userId = searchParams.get("userId")
    const configId = searchParams.get("configId")

    const [pallet, setPallet] = useState<string | undefined>(undefined)
    const [strip, setStrip] = useState<string | undefined>(undefined)
    const [passepartout, setPassepartout] = useState<boolean>(false)

    const { data: image } = useSWR<Item>(`/api/image/${itemid}`, fetcher)
    const { data: configurationOptions } = useSWR<ConfigurationOptions>("/api/image/configure", fetcher)
    const { data: categories } = useSWR("/api/category", fetcher)
    const { data: existingConfiguration } = useSWR(`/api/users/${userId}/${configId}`, fetcher)

    useEffect(() => {
        if (!existingConfiguration) {
            return
        }

        setPallet(existingConfiguration.pallet ?? undefined)
        setStrip(existingConfiguration.strip ?? undefined)
        setPassepartout(existingConfiguration.passepartout)
    }, [existingConfiguration])

    if (!image || !configurationOptions || !categories) {
        return null
    }

    const calculatedPrice = (image.price + (strip ? image.price * 0.15 : 0)) / 100

    // eslint-ignore-next-line
    const category = categories.find((category: any) => category.id === image.category_id)

    return (
        <div className={"flex flex-col p-6 gap-12"}>
            <h1 className={"text-2xl font-semibold"}>Bildkonfigurator</h1>
            <div className={"flex gap-4"}>
                <img
                    src={image.image_path}
                    className={"w-1/2 rounded"}
                />
                <div className={"flex flex-col w-1/2 gap-4"}>
                    <div>
                        <h2 className={"text-3xl font-bold"}>{image.title}</h2>
                        <p>{image.notice}</p>
                        <small>von {image.artist}</small>
                    </div>
                    <hr/>
                    <div>
                        <p>Kategorie: {category.name}</p>
                        <p>Preis: {calculatedPrice.toFixed(2)}€</p>
                    </div>
                    <hr/>
                    <div>
                        <Label
                            htmlFor={"pallet"}
                            className={"mb-2"}
                        >Zierleiste</Label>
                        <Select
                            name={"pallet"}
                            onValueChange={(value: string) => {
                                if (value === "no") {
                                    setPallet(undefined)
                                }

                                setPallet(value)
                            }}
                            value={pallet}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Keine Zierleiste"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    key={0}
                                    value={"no"}
                                >Keine Zierleiste</SelectItem>
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
                        <Label
                            htmlFor={"passepartout"}
                            className={"mb-2"}
                        >Passepartout</Label>
                        <Select
                            name={"passepartout"}
                            onValueChange={(value: string) => {
                                if (value === "no") {
                                    setPassepartout(false)
                                    return
                                }

                                setPassepartout(true)
                            }}
                            value={passepartout ? "yes" : "no"}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Kein Passepartout"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    key={0}
                                    value={"no"}
                                >Kein Passepartout</SelectItem>
                                <SelectItem
                                    key={1}
                                    value={"yes"}
                                >Passepartout</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label
                            htmlFor={"strip"}
                            className={"mb-2"}
                        >Rahmen</Label>
                        <Select
                            name={"strip"}
                            onValueChange={(value: string) => {
                                if (value === "no") {
                                    setStrip(undefined)
                                }

                                setStrip(value)
                            }}
                            value={strip}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Kein Rahmen"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    key={0}
                                    value={"no"}
                                >Kein Rahmen</SelectItem>
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
                    <div className={"flex flex-row-reverse mt-6"}>
                        <Button
                            onClick={() => {
                                (async () => {
                                    fetch(`/api/image/configure/${userId}?configId=${configId}`, {
                                        method: configId ? "PUT" : "POST",
                                        body: JSON.stringify({
                                            strip: strip ?? null,
                                            pallet: pallet ?? null,
                                            passepartout,
                                            imageId: itemid
                                        })
                                    })
                                        .then(() => router.back())
                                })()
                            }}
                        ><Heart/>{configId ? "Auswahl aktualisieren" : "Zur Auswahlmappe hinzufügen"}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}