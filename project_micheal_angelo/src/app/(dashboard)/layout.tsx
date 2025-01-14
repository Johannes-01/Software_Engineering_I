"use client"

import React from "react";
import { Button } from "@components/ui/button";
import { deleteCookie } from "cookies-next"
import { useRouter } from "next/navigation";
import useSWRImmutable from "swr/immutable"
import Link from "next/link";

interface UserData {
    isAdmin: boolean
    userId: string
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { data: userInformation } = useSWRImmutable<UserData>("/api/get-user-information", async (url: string) => {
        try {
            return await (await fetch(url)).json()
        } catch {
            return false
        }
    }, { keepPreviousData: true })

    if (userInformation === undefined) {
        return null
    }

    return (
        <div className={"flex h-screen w-full"}>
            <aside className={"flex flex-col p-4 h-screen justify-between border-r-gray-100 border-r-2"}>
                <div className={"flex flex-col"}>
                    <Link href={"/gallery"}>
                        <Button className={"w-full"} variant={"ghost"}>Galerie</Button>
                    </Link>
                    {!userInformation.isAdmin && <Link href={`/user/${userInformation.userId}`}>
                        <Button className={"w-full"} variant={"ghost"}>Auswahlmappe</Button>
                    </Link>}
                    {userInformation.isAdmin && <Link href={"/user"}>
                        <Button className={"w-full"} variant={"ghost"}>Nutzer</Button>
                    </Link>}
                    {userInformation.isAdmin && <Link href={"/topics"}>
                        <Button className={"w-full"} variant={"ghost"}>Themenmappe</Button>
                    </Link>}
                    {userInformation.isAdmin && <Link href={"/categories"}>
                        <Button className={"w-full"} variant={"ghost"}>Kategorien</Button>
                    </Link>}
                </div>
                <Button onClick={() => {
                    deleteCookie("sb-127-auth-token")
                    void router.push("/login")
                }}>Logout</Button>
            </aside>
            <div className={"overflow-y-auto w-full"}>
                {children}
            </div>
        </div>
    );
}