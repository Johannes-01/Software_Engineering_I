import { handlerWithPreconditions, requireAdmin } from "@utils/custom-middleware";
import { badRequestError, conflictError, internalServerError } from "@utils/server-errors";
import { createSupabaseClient } from "@utils/supabase-helper";
import { NextRequest, NextResponse } from "next/server";

export const GET = handlerWithPreconditions(
    [requireAdmin],
    async ({ supabaseClient }, _1, _2) => {
        supabaseClient ??= await createSupabaseClient()

        const {
            data,
            error,
        } = await supabaseClient.from('category').select('*');

        if (error) {
            console.error("/api/category:GET -> ", error.message);
            return internalServerError();
        }

        return NextResponse.json(data, { status: 200 });
    }
)

export const POST = handlerWithPreconditions(
    [requireAdmin],
    async ({ supabaseClient }, request: NextRequest, _) => {
        supabaseClient ??= await createSupabaseClient()

        const { name } = await request.json();

        if (!name) {
            return badRequestError("name is missing in request body");
        }

        const {
            data,
            error: selectError,
        } = await supabaseClient.from("category").select("name").eq("name", name);

        if (selectError) {
            console.error("/api/category:POST -> ", selectError.message);
            return internalServerError();
        }

        if (!data || data.length > 0) {
            return conflictError();
        }

        const { error: insertError } = await supabaseClient.from("category").insert({ name });

        if (insertError) {
            console.error("/api/category:POST -> ", insertError.message);
            return internalServerError();
        }

        return new NextResponse("Created", { status: 201 });
    },
)
