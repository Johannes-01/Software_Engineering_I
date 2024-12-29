'use server';

import { NextResponse } from "next/server";
import { handlerWithPreconditions, MiddlewareContext, requireAdmin } from "@utils/custom-middleware";
import { internalServerError } from "@utils/server-errors";

interface GetContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
}

export const GET = handlerWithPreconditions<GetContext>(
    [requireAdmin],
    async ({ supabaseClient, route }, _, { params }: { params: { topicFolderId: string }}) => {
        const { data, error } = await supabaseClient
            .from("image_to_topic_folder")
            .select(`
                image(*)
            `)
            .eq("topic_folder_id", params.topicFolderId)

        if (error) {
            console.error(`${route} -> `, error.message)
            return internalServerError()
        }

        return NextResponse.json(data, { status: 200 })
    },
    {
        route: "/api/topic-folder/[topicFolderId]:GET",
    },
)