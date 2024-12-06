import { handlerWithPreconditions, requireAdmin } from "@utils/custom-middleware";
import { badRequestError, conflictError, internalServerError, notFoundError } from "@utils/server-errors";
import { createSupabaseClient } from '@utils/supabase-helper';
import { NextResponse } from 'next/server';

export const PUT = handlerWithPreconditions(
    [requireAdmin],
    async ({ supabaseClient }, request, { params }: { params: { categoryId: string } }) => {
        supabaseClient ??= await createSupabaseClient()

        const { name } = await request.json();

        if (!name) {
            return badRequestError("name is missing in request body");
        }

        const {
            data: idMatch,
            error: selectError,
        } = await supabaseClient.from("category").select("id").eq("id", params.categoryId);

        if (selectError) {
            console.error("/api/category/[categoryId]:PUT | id check -> ", selectError.message);
            return internalServerError();
        }

        if (!idMatch || idMatch.length === 0) {
            return notFoundError("No category with the specified if");
        }

        const {
            data: nameAlreadyExists,
            error: selectNameError,
        } = await supabaseClient.from("category").select("name").eq("name", name);

        if (selectNameError) {
            console.error("/api/category/[categoryId]:PUT | duplication check -> ", selectNameError.message);
            return internalServerError();
        }

        if (!!nameAlreadyExists && nameAlreadyExists.length > 0) {
            return conflictError();
        }

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
)
