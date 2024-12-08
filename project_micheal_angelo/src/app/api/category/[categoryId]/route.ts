import { SupabaseClient } from "@supabase/supabase-js";
import {
    handlerWithPreconditions, MiddlewareContext,
    requireAdmin,
    requireUnique,
    requireExists,
    validateBody,
} from "@utils/custom-middleware";
import { conflictError, internalServerError } from "@utils/server-errors";
import { NextResponse } from 'next/server';
import z from "zod"

const putRequestSchema = z.object({
    name: z.string().min(1),
})

interface PutContext extends MiddlewareContext {
    supabaseClient: SupabaseClient,
    body: { name: string },
}

export const PUT = handlerWithPreconditions<PutContext>(
    [
        requireAdmin,
        validateBody(putRequestSchema),
        async (context, _, args) => requireExists("category", "id", args.params.categoryId)(context),
        async (context) => requireUnique("category", { name: context.body!.name })(context),
    ],
    async (
        {
            supabaseClient,
            body: { name },
        },
        _,
        { params },
    ) => {
        const {
            error: updateError,
        } = await supabaseClient
            .from("category")
            .update({ name })
            .eq("id", params.categoryId);

        if (updateError) {
            console.error("/api/category/[categoryId]:PUT | update -> ", updateError.message);
            return internalServerError();
        }

        return new NextResponse("Created", { status: 201 });
    },
    {
        route: "/api/category/[categoryId]:PUT",
    },
)

interface DeleteContext extends MiddlewareContext {
    supabaseClient: SupabaseClient
}

export const DELETE = handlerWithPreconditions<DeleteContext>(
    [
        requireAdmin,
        async (context, _, { params }) => requireExists("category", "id", params.categoryId)(context),
    ],
    async (
        {
            supabaseClient,
            route,
        },
        _,
        { params },
    ) => {
        if (["0", "1", "2"].includes(params.categoryId)) {
            console.error(`${route} -> cannot delete initial category ${params.categoryId}`);
            return conflictError(`Cannot delete initial category ${params.categoryId}`)
        }

        const { error: deleteError } = await supabaseClient.from("category").delete().eq("id", params.categoryId)

        if (deleteError) {
            console.error(`${route} | delete did failed -> `, deleteError.message)
            return internalServerError()
        }

        return new NextResponse("OK", { status: 200 })
    },
    {
        route: "/api/category/[categoryId]:DELETE",
    },
)
