import { handlerWithPreconditions, MiddlewareContext, requireAdmin, requireExists } from "@utils/custom-middleware";
import { internalServerError } from "@utils/server-errors";
import { NextResponse } from "next/server";

interface Slug {
    params: {
        topicFolderId: string,
        imageId: string
    }
}

const topicFolderShouldExist = async (context: MiddlewareContext, _: unknown, { params }: Slug) => requireExists(
    "image_to_topic_folder",
    { topic_folder_id: params.topicFolderId }
)(context)

interface DeleteContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
}

export const DELETE = handlerWithPreconditions<DeleteContext>(
    [
        requireAdmin,
        topicFolderShouldExist,
    ],
    async ({ supabaseClient, route }, _, { params }: Slug) => {
        const { error } = await supabaseClient
            .from("image_to_topic_folder")
            .delete()
            .eq("image_id", params.imageId)
            .eq("topic_folder_id", params.topicFolderId)

        if (error) {
            console.error(`${route} -> ${error.message}`)
            return internalServerError()
        }

        return new NextResponse("Deleted", { status: 200 })
    },
    {
        route: "/api/topic-folder/topicFolderId/imageId/"
    }
)