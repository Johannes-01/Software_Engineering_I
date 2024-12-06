'use server';

import { NextResponse } from "next/server";
import { handlerWithPreconditions, MiddlewareContext, requireAdmin } from "@utils/custom-middleware";
import { internalServerError } from "@utils/server-errors";


interface GetContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
}

export const GET = handlerWithPreconditions<GetContext>(
    [requireAdmin],
    async ({ supabaseClient, route }) => {
        const { data, error } = await supabaseClient.from("topic_folder").select("*")

        if (error) {
            console.log(`${route} -> `, error.message)
            return internalServerError()
        }

        return NextResponse.json(data, { status: 200 })
    },
    {
        route: "/api/topic-folder:GET"
    }
)