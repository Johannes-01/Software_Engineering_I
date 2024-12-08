import { NextResponse } from "next/server";
import {
    handlerWithPreconditions,
    MiddlewareContext,
    requireAdmin,
    requireUnique,
    validateBody
} from "@utils/custom-middleware";
import { internalServerError } from "@utils/server-errors";
import z from "zod";


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

interface PostContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
    body: { title: string }
}

const postBody = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
})

export const POST = handlerWithPreconditions<PostContext>(
    [
        requireAdmin,
        validateBody(postBody),
        async (context) => requireUnique("topic_folder", { name: context.body!.name })(context)
    ],
    async ({ supabaseClient, body, route }) => {
        const { error } = await supabaseClient.from("topic_folder").insert(body)

        if (error) {
            console.error(`${route} -> `, error.message)
            return internalServerError()
        }

        return new NextResponse("Created", { status: 201 })
    },
    {
        route: "/api/topic-folder:POST",
    }
)