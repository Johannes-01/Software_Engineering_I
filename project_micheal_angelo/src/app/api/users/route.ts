'use server';

import { NextResponse } from "next/server";
import { handlerWithPreconditions, requireAdmin, MiddlewareContext } from "@utils/custom-middleware";
import { internalServerError } from "@utils/server-errors";
import { createSupabaseAdminClient } from "@utils/supabase-helper";

interface GetContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
}

export const GET = handlerWithPreconditions<GetContext>(
    [requireAdmin],
    async () => {
        const { data: { users }, error } = await (await createSupabaseAdminClient()).auth.admin.listUsers()

        if (error) {
            console.error("Error while fetching users", error)
            internalServerError()
        }

        return NextResponse.json(
            users
                .filter(user => user.user_metadata.role !== "admin")
                .map(user => ({
                    id: user.id,
                    email: user.email
                })),
            {
                status: 200,
            }
        )
    }
)