import { NextResponse } from "next/server";
import {
    handlerWithPreconditions,
    MiddlewareContext,
    requireAdmin, requireExists,
    requireUnique,
    validateBody
} from "@utils/custom-middleware";
import { internalServerError } from "@utils/server-errors";
import z from "zod";

interface GetContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
}

type Slug = { params: { topicFolderId: string } };

export const GET = handlerWithPreconditions<GetContext>(
    [requireAdmin],
    async ({ supabaseClient, route }, _, { params }: Slug) => {
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

interface PostContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>,
    body: { imageId: string }
}

const postBody = z.object({
    imageId: z.string().min(1),
})

const imageIdShouldExist = async (context: MiddlewareContext) => requireExists(
    "image",
    { id: context.body!.imageId }
)(context)

const topicFolderShouldExist = async (context: MiddlewareContext, _: unknown, { params }: Slug) => requireExists(
    "topic_folder",
    { id: params.topicFolderId }
)(context)

const imageShouldNotAlreadyExistInTopicFolder = async (context: MiddlewareContext, _: unknown, { params }: Slug) => requireUnique(
    "image_to_topic_folder",
    {
        topic_folder_id: params.topicFolderId,
        image_id: context.body!.imageId
    }
)(context)

export const POST = handlerWithPreconditions<PostContext>(
    [
        requireAdmin,
        validateBody(postBody),
        imageIdShouldExist,
        topicFolderShouldExist,
        imageShouldNotAlreadyExistInTopicFolder,
    ],
    async ({ supabaseClient, body, route }, _, { params }: Slug) => {
        const { error } = await supabaseClient.from("image_to_topic_folder").insert({
            image_id: body.imageId,
            topic_folder_id: params.topicFolderId
        })

        if (error) {
            console.error(`${route} -> ${error.message}`)
            return internalServerError()
        }

        return new NextResponse("Created", { status: 201 })
    },
    {
        route: "/api/topic-folder/[topicFolderId]:POST",
    },
)

interface PutContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>,
    body: { name: string, description?: string }
}

const putBody = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
})

export const PUT = handlerWithPreconditions<PutContext>(
    [
        requireAdmin,
        validateBody(putBody),
        topicFolderShouldExist,
    ],
    async ({ supabaseClient, body, route }, _, { params }: Slug) => {
        const { error } = await supabaseClient
            .from("topic_folder")
            .update({
                ...(body.name === undefined ? {} : { name: body.name }),
                ...(body.description === undefined ? {} : { description: body.description })
            })
            .eq("id", params.topicFolderId)

        if (error) {
            console.error(`${route} -> ${error.message}`)
            return internalServerError()
        }

        return new NextResponse("Updated", { status: 200 })
    },
    {
        route: "/api/topic-folder/[topicFolderId]:PUT",
    },
)

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
            .from("topic_folder")
            .delete()
            .eq("id", params.topicFolderId)

        if (error) {
            console.error(`${route} -> ${error.message}`)
            return internalServerError()
        }

        return new NextResponse("Deleted", { status: 200 })
    }
)