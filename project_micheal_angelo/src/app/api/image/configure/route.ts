'use server';

import { NextResponse } from "next/server";
import { handlerWithPreconditions, MiddlewareContext, requireUser, validateBody } from "@utils/custom-middleware";
import { forbiddenError } from "@utils/server-errors";
import z from "zod";

interface GetContext extends MiddlewareContext {
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

export const POST = handlerWithPreconditions<GetContext>(
    [requireUser, validateBody(bodySchema)],
    async ({ supabaseClient, user, body }, _, { params }: { params: { userId: string }}) => {
        if (user.id !== params.userId && user.user_metadata.role !== "admin") {
            return forbiddenError()
        }

        await supabaseClient.from("selection").insert({
            strip: body.strip,
            pallet: body.pallet,
            passepartout: body.passepartout,
            image_id: body.imageId,
            customer_id: user.id,
            is_recommendation: user.user_metadata.role === "admin",
        })

        return new NextResponse("Created", { status: 201 })
    }
)