import {
    handlerWithPreconditions,
    MiddlewareContext,
    requireAdmin,
    requireUnique,
    validateBody,
} from "@utils/custom-middleware";
import { internalServerError } from "@utils/server-errors";
import { NextResponse } from "next/server";
import z from "zod";

interface GetContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
}

export const GET = handlerWithPreconditions<GetContext>(
    [requireAdmin],
    async ({
        supabaseClient,
        route,
    }) => {
        const {
            data,
            error,
        } = await supabaseClient.from('category').select('*')

        if (error) {
            console.error(`${route} -> `, error.message)
            return internalServerError()
        }

        return NextResponse.json(data, { status: 200 })
    },
    {
        route: "/api/category:GET",
    },
)

interface PostContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
    body: { name: string }
}

const postSchema = z.object({
    name: z.string().min(1),
})

export const POST = handlerWithPreconditions<PostContext>(
    [
        requireAdmin,
        validateBody(postSchema),
        async (context) => requireUnique("category", { name: context.body!.name })(context),
    ],
    async ({
        supabaseClient,
        body: { name },
    }) => {
        const { error: insertError } = await supabaseClient.from("category").insert({ name });

        if (insertError) {
            console.error("/api/category:POST -> ", insertError.message);
            return internalServerError();
        }

        return new NextResponse("Created", { status: 201 });
    },
)
