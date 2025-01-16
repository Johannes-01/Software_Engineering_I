"use client"

import React, { useState } from 'react';
import useSWR from "swr";
import { useParams } from "next/navigation";
import TopicCard from "./_local/topic-card"
import { createPortal } from "react-dom";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Plus } from "lucide-react"
import { DialogBody } from "next/dist/client/components/react-dev-overlay/internal/components/Dialog";

const TopicsPage: React.FC = () => {
    const { topicId } = useParams()
    const {
        data: imagesInTopicFolder,
        mutate
    } = useSWR(`/api/topic-folder/${topicId}`, async (url: string) => {
        return await (await fetch(url)).json()
    })

    const [cardToRemove, setCardToRemove] = useState<number | undefined>(undefined)
    const [addImageDialogVisible, setAddImageDialogVisible] = useState<boolean>(false)
    const [imageId, setImageId] = useState("")

    if (!imagesInTopicFolder) {
        return null
    }

    return (
        <div className={"flex mx-auto p-4 flex-col"}>
            <div className={"flex justify-between"}>
                <h1 className={"text-2xl mb-4"}>Themenmappe</h1>
                <Button onClick={() => setAddImageDialogVisible(true)}>
                    <Plus /> Bild hinzufügen
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {
                    imagesInTopicFolder.map((image: any) => {
                        return (
                            <TopicCard
                                key={image.image.id}
                                image={image.image}
                                deleteCard={setCardToRemove}
                            />
                        )
                    })
                }
            </div>
            {createPortal(
                <AlertDialog open={!!cardToRemove}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Wirklich löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Möchtest du das Bild wirklich aus der Auswahl mappe löschen?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setCardToRemove(undefined)}>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    fetch(`/api/topic-folder/${topicId}/${cardToRemove}`, {
                                        method: "DELETE"
                                    })
                                        .finally(() => {
                                            setCardToRemove(undefined)
                                            void mutate()
                                        })
                                }}
                            >Löschen</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>,
                document.body
            )}
            {createPortal(
                <Dialog open={addImageDialogVisible}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Bild hinzufügen</DialogTitle>
                            <DialogDescription>
                                Welches Bild soll hinzugefügt werden?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogBody>
                            <Input
                                value={imageId}
                                onChange={(e) => {
                                    setImageId(e.target.value)
                                }}
                            ></Input>
                        </DialogBody>
                        <DialogFooter className={"flex justify-end gap-2"}>
                            <Button
                                variant={"secondary"}
                                onClick={() => {
                                    setAddImageDialogVisible(false)
                                }}
                            >Abbrechen</Button>
                            <Button
                                onClick={() => {
                                    fetch(`/api/topic-folder/${topicId}`, {
                                        method: "POST",
                                        body: JSON.stringify({ imageId })
                                    })
                                        .then(() => {
                                            setImageId("")
                                            setAddImageDialogVisible(false)
                                            void mutate()
                                        })
                                }}
                            >
                                Hinzufügen
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>,
                document.body
            )}
        </div>
    );
};

export default TopicsPage;