import { NextResponse } from "next/server";
import { createSupabaseClient } from "@utils/supabase-helper";
import { unauthorizedError } from "@utils/server-errors";

export async function GET() {
    const supabaseClient = await createSupabaseClient()

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (user === null) {
        return unauthorizedError()
    }

    return NextResponse.json({
        isAdmin: user.user_metadata.role === "admin",
        userId: user.id,
    })
}