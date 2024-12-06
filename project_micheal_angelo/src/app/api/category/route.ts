import {
    badRequestError,
    conflictError,
    forbiddenError,
    internalServerError,
    unauthorizedError,
} from "@utils/server-errors";
import { createSupabaseClient, isAdmin } from "@utils/supabase-helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const supabase = await createSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return unauthorizedError();
    }

    if (!isAdmin(user)) {
        return forbiddenError();
    }

    const { data, error } = await supabase.from('category').select('*');

    if (error) {
        console.error("/api/category:GET -> ", error.message);
        return internalServerError();
    }

    return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return unauthorizedError();
    }

    if (!isAdmin(user)) {
        return forbiddenError();
    }

    const { name } = await request.json();

    if (!name) {
        return badRequestError("name is missing in request body");
    }

    const { data, error: selectError } = await supabase.from("category").select("name").eq("name", name);

    if (selectError) {
        console.error("/api/category:POST -> ", selectError.message);
        return internalServerError();
    }

    if (!data || data.length > 0) {
        return conflictError();
    }

    const { error: insertError } = await supabase.from("category").insert({ name });

    if (insertError) {
        console.error("/api/category:POST -> ", insertError.message);
        return internalServerError();
    }

    return new NextResponse("Created", { status: 201 });
}
