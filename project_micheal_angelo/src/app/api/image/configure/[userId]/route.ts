'use server';

import { NextResponse } from "next/server";
import { handlerWithPreconditions, MiddlewareContext, requireUser, validateBody } from "@utils/custom-middleware";
import { forbiddenError } from "@utils/server-errors";
import z from "zod";

interface PostContext extends MiddlewareContext {
    user: Exclude<MiddlewareContext["user"], undefined>
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
    body: { strip: string | null, pallet: string | null, passepartout: boolean, imageId: string }
}

const bodySchema = z.object({
    strip: z.string().nullable(),
    pallet: z.string().nullable(),
    passepartout: z.boolean(),
    imageId: z.string(),
})

export const POST = handlerWithPreconditions<PostContext>(
    [requireUser, validateBody(bodySchema)],
    async (
        {
            supabaseClient,
            user,
            body,
            route,
        },
        _,
        { params }: { params: { userId: string } }
    ) => {
        if (user.id !== params.userId && user.user_metadata.role !== "admin") {
            console.error(`${route} | the logged in user cannot perform this action`)
            return forbiddenError()
        }

        await supabaseClient.from("selection").insert({
            strip: body.strip,
            pallet: body.pallet,
            passepartout: body.passepartout,
            image_id: body.imageId,
            customer_id: params.userId,
            is_recommendation: user.user_metadata.role === "admin",
        })

        return new NextResponse("Created", { status: 201 })
    },
    {
        route: "/api/image/configure/:userId :POST"
    }
)

export const PUT = handlerWithPreconditions<PostContext>(
    [requireUser, validateBody(bodySchema)],
    async (
        {
            supabaseClient,
            user,
            body
        },
        request,
        { params }: { params: Promise<{ userId: string }> }
    ) => {
        const userId = (await params).userId

        if (user.id !== userId && user.user_metadata.role !== "admin") {
            return forbiddenError()
        }

        const configId = request.nextUrl.searchParams.get("configId")

        await supabaseClient
            .from("selection")
            .update({
                strip: body.strip,
                pallet: body.pallet,
                passepartout: body.passepartout,
                is_recommendation: user.user_metadata.role === "admin",
            })
            .eq("id", configId)

        return new NextResponse("Created", { status: 201 })
    },
    {
        route: "/api/image/configure/:userId :PUT"
    }
)