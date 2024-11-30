import { SupabaseClient, User } from "@supabase/supabase-js";
import {
    badRequestError, conflictError,
    forbiddenError,
    internalServerError,
    notFoundError,
    unauthorizedError,
} from "@utils/server-errors";
import { createSupabaseClient } from "@utils/supabase-helper";
import { NextRequest, NextResponse } from "next/server";
import z from "zod"

export interface MiddlewareContext {
    supabaseClient?: SupabaseClient
    user?: User
    body?: Record<string, any>;
    route: string;
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

type Precondition = (
    context: MiddlewareContext,
    request: NextRequest,
    args: Args,
) => Promise<MiddlewareContext | NextResponse>
type HandlerFunction<T extends MiddlewareContext> = (
    context: T,
    request: Request,
    args: Args,
) => Promise<NextResponse<unknown>>

export function handlerWithPreconditions<T extends MiddlewareContext>(
    preconditions: Precondition[],
    handler: HandlerFunction<T>,
    context: MiddlewareContext = { route: "undefined call context" },
) {
    return async (request: Request, args: Args): Promise<NextResponse<unknown>> => {
        for (const precondition of preconditions) {
            const result = await precondition(context, request, args)

            if (result instanceof NextResponse) {
                return result
            }

            context = result
        }

        return handler(context as T, request, args)
    }
}

export async function requireAdmin(context: MiddlewareContext): Promise<RequireAdminMiddlewareContext | NextResponse> {
    context.supabaseClient ??= await createSupabaseClient()

    context.user ??= (await context.supabaseClient.auth.getUser()).data.user as User | undefined

    if (!context.user) {
        console.error(`${context.route} | user needs to be logged in`)
        return unauthorizedError();
    }

    if (context.user.user_metadata.role !== "admin") {
        console.error(`${context.route} | user does not seem to be an admin`)
        return forbiddenError()
    }

    return context as RequireAdminMiddlewareContext
}

export function validateBody(schema: z.ZodObject<any>) {
    return async (
        context: MiddlewareContext,
        request: NextRequest,
    ): Promise<MiddlewareContext | NextResponse> => {
        context.body ??= await request.json()

        const { error } = schema.safeParse(context.body)

        if (error) {
            console.error(`${context.route} | route called with invalid body`)
            return badRequestError(error.message)
        }

        return context
    }
}

export function requireExists(table: string, tableKey: string, value: string) {
    return async (context: MiddlewareContext) => {
        context.supabaseClient ??= await createSupabaseClient()

        const {
            data: idMatch,
            error: selectError,
        } = await context.supabaseClient.from(table).select(tableKey).eq(tableKey, value);

        if (selectError) {
            console.error(`${context.route} | unexpected supabase error when checking if value exists -> `, selectError.message);
            return internalServerError();
        }

        if (!idMatch || idMatch.length === 0) {
            console.error(`${context.route} | `)
            return notFoundError(`Could not find value of ${value} inside ${tableKey} of ${table}`);
        }

        return context;
    }
}

export function requireUnique(table: string, columnKey: string, value: string) {
    return async (context: MiddlewareContext) => {
        context.supabaseClient ??= await createSupabaseClient()

        const {
            data: valueAlreadyExists,
            error: selectNameError,
        } = await context.supabaseClient.from(table).select(columnKey).eq(columnKey, value)

        if (selectNameError) {
            console.error(`${context.route} | unexpected supabase error when checking for unique item -> `, selectNameError.message)
            return internalServerError()
        }

        if (!!valueAlreadyExists && valueAlreadyExists.length > 0) {
            console.error(`${context.route} | value already exists`)
            return conflictError()
        }

        return context
    }
}
