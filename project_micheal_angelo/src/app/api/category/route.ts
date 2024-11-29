import { forbiddenError, internalServerError, unauthorizedError } from "@utils/server-errors";
import { createSupabaseClient, isAdmin } from "@utils/supabase-helper";
import { NextResponse } from "next/server";

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
