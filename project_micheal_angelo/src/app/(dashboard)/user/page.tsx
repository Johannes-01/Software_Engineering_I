import React from 'react';
import { createSupabaseClient, isAdmin } from "@utils/supabase-helper";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAllUsers } from "../../../services/get-all-users";

export default async function UserDashboard() {
    const supabaseClient = await createSupabaseClient()

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
        return null
    }

    if (!isAdmin(user)) {
        redirect(`/user/${user.id}`)
    }

    const userList = await getAllUsers()

    if (!userList) {
        return null
    }

    return (
        <div className={"p-6"}>
            <h3 className={"text-2xl mb-4"}>Registrierte Nutzer</h3>
            <div className={"flex flex-wrap gap-4"}>
                {userList.map((user) => {
                    return (
                        <Link
                            key={user.id}
                            className={"border rounded p-4"}
                            href={`/user/${user.id}`}
                        >
                            {user.email}
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}