import { SupabaseClient, User } from "@supabase/supabase-js";
import { forbiddenError, unauthorizedError } from "@utils/server-errors";
import { createSupabaseClient, isAdmin } from "@utils/supabase-helper";
import { NextRequest, NextResponse } from "next/server";

interface MiddlewareContext {
    supabaseClient?: SupabaseClient
    user?: User
}

interface RequireAdminMiddlewareContext extends MiddlewareContext {
    supabaseClient: SupabaseClient
    user: User
}

type Request = NextRequest
type Args = {
    params: {
        categoryId: string,
    }
}

type Precondition = (context: MiddlewareContext) => Promise<MiddlewareContext | NextResponse>
type HandlerFunction = (context: MiddlewareContext, request: Request, args: Args) => Promise<NextResponse<unknown>>

export function handlerWithPreconditions(preconditions: Precondition[], handler: HandlerFunction) {
    return async (request: Request, args: Args): Promise<NextResponse<unknown>> => {
        let context: MiddlewareContext = {}
        for (const precondition of preconditions) {
            const result = await precondition(context)

            if (result instanceof NextResponse) {
                return result
            }

            context = result
        }

        return handler(context, request, args)
    }
}

export async function requireAdmin(context: MiddlewareContext): Promise<RequireAdminMiddlewareContext | NextResponse> {
    context.supabaseClient ??= await createSupabaseClient()

    context.user ??= (await context.supabaseClient.auth.getUser()).data.user as User | undefined

    if (!context.user) {
        return unauthorizedError();
    }

    if (context.user.user_metadata.role !== "admin") {
        return forbiddenError()
    }

    return context as RequireAdminMiddlewareContext
}
