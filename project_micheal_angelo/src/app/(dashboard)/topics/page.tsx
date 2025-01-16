"use client"

import React, { useState } from 'react';
import useSWR from "swr";
import { Topic } from "@type/topic";
import Link from "next/link";
import { Edit, Trash2, Plus } from "lucide-react"
import { createPortal } from "react-dom";
import { Input } from "@components/ui/input"
import { Button } from "@components/ui/button";

interface DialogMode {
    mode: "edit" | "add" | "delete"
    topic: Topic
}

const TopicsPage: React.FC = () => {
    const {
        data: topics,
        error,
        mutate
    } = useSWR<Topic[]>("/api/topic-folder", (url: string) => fetch(url).then(async (res) => await res.json()));

    const [cardHovered, setCardHovered] = useState<number | undefined>(undefined);
    const [dialogMode, setDialogMode] = useState<DialogMode | undefined>(undefined)

    if (!topics) {
        return null
    }

    if (error) {
        return <div>Error loading topics</div>;
    }

    return (
        <div>
            <header className={"w-full flex flex-row justify-between p-8"}>
                <h1 className={"font-bold text-4xl"}>Themenmappen</h1>
                <Button
                    onClick={() => setDialogMode({ mode: "add",
                        topic: {
                            name: "",
                            id: -1
                        }
                    })}
                >
                    <Plus/> Themenmappe hinzufügen
                </Button>
            </header>
            <div className={"grid grid-cols-3 gap-2 p-6"}>
                {topics.map((topic) => {
                    return (
                        <Link
                            href={`/topics/${topic.id}`}
                            key={topic.id}
                            className="relative w-full h-20 flex justify-start items-center border-2 border-gray-200 rounded-xl p-6"
                            onMouseLeave={() => setCardHovered(undefined)}
                            onMouseEnter={() => setCardHovered(topic.id)}
                        >
                            <h2>{topic.name}</h2>
                            {cardHovered === topic.id && (
                                <div className={"absolute right-1 top-2/5 flex flex-row gap-2 mr-4"}>
                                    <button
                                        className={"w-8 h-8 rounded"}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setDialogMode({
                                                mode: "edit",
                                                topic
                                            })
                                        }}
                                    >
                                        <Edit/>
                                    </button>
                                    <button
                                        className={"w-8 h-8 rounded"}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setDialogMode({
                                                mode: "delete",
                                                topic
                                            })
                                        }}
                                    >
                                        <Trash2 color={"red"}/>
                                    </button>
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>
            {(dialogMode?.mode === "edit" || dialogMode?.mode === "add") && createPortal(
                <Dialog>
                    {dialogMode.mode === "edit" ? "Bearbeiten" : "Hinzufügen"}
                    <Input
                        value={dialogMode.topic.name}
                        onChange={(e) => {
                            setDialogMode((pre) => ({
                                ...pre,
                                topic: {
                                    ...dialogMode.topic,
                                    name: e.target.value
                                }
                                // eslint-disable-next-line
                            }) as any)
                        }}
                    />
                    <div className={"flex flex-row gap-2 justify-end"}>
                        <Button variant={"outline"} onClick={() => setDialogMode(undefined)}>Abbrechen</Button>
                        {dialogMode.mode === "add" && <Button onClick={() => {
                            if (dialogMode.mode === "add") {
                                (async () => {
                                    await fetch(
                                        "/api/topic-folder",
                                        {
                                            method: "POST",
                                            body: JSON.stringify({ name: dialogMode.topic.name })
                                        }
                                    )
                                    mutate()
                                })()
                                setDialogMode(undefined)
                            }
                        }}>
                            Hinzufügen
                        </Button>}
                        {dialogMode.mode === "edit" && <Button onClick={() => {
                            (async () => {
                                await fetch(
                                    `/api/topic-folder/${dialogMode.topic.id}`,
                                    {
                                        method: "PUT",
                                        body: JSON.stringify({ name: dialogMode.topic.name })
                                    }
                                )
                                mutate()
                                setDialogMode(undefined)
                            })()
                        }}>
                            Speichern
                        </Button>}
                    </div>
                </Dialog>,
                document.body
            )}
            {(dialogMode?.mode === "delete") && createPortal(
                <Dialog>
                    <h2 className={"text-xl"}>Wirklich löschen?</h2>
                    <p className={"text-gray-600"}>Löschen einer Kategorie kann nicht rückgängig gemacht werden</p>
                    <div className={"flex flex-row gap-2 justify-end"}>
                        <Button variant={"outline"} onClick={() => setDialogMode(undefined)}>Abbrechen</Button>
                        <Button
                            onClick={() => {
                                (async () => {
                                    await fetch(`/api/topic-folder/${dialogMode.topic.id}`, { method: "DELETE" })
                                    mutate()
                                    setDialogMode(undefined)
                                })()
                            }}
                        >Löschen</Button>
                    </div>
                </Dialog>,
                document.body
            )}
        </div>
    );
};

const Dialog: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className={"bg-black bg-opacity-40 w-full h-full absolute top-0 left-0"}>
            <dialog
                className={"flex absolute top-1/3 left-1/3 w-1/3 h-50 bg-white flex-col gap-4 border-2 border-gray-200 p-4 rounded-xl  m-0"}>
                {children}
            </dialog>
        </div>
    )
}


export default TopicsPage;