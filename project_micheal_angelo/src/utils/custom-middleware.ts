import { SupabaseClient, User } from "@supabase/supabase-js";
import {
    badRequestError, conflictError,
    forbiddenError,
    internalServerError,
    notFoundError,
    unauthorizedError,
} from "../utils/server-errors";
import { createSupabaseClient } from "../utils/supabase-helper";
import { NextRequest, NextResponse } from "next/server";
import z from "zod"

export interface MiddlewareContext {
    supabaseClient?: SupabaseClient
    user?: User
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: Record<string, any>;
    route: string;
}

interface MiddlewareContextWithUser extends MiddlewareContext {
    supabaseClient: SupabaseClient
    user: User
}

type Precondition = (
    context: MiddlewareContext,
    request: NextRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any,
) => Promise<MiddlewareContext | NextResponse>
type HandlerFunction<T extends MiddlewareContext> = (
    context: T,
    request: NextRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any,
) => Promise<NextResponse<unknown>>

export function handlerWithPreconditions<T extends MiddlewareContext>(
    preconditions: Precondition[],
    handler: HandlerFunction<T>,
    initialContext?: MiddlewareContext,
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (request: NextRequest, args: any): Promise<NextResponse<unknown>> => {
        let context = structuredClone(initialContext) ?? { route: "undefined call context" }

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

export async function requireUser(context: MiddlewareContext): Promise<MiddlewareContextWithUser | NextResponse> {
    context.supabaseClient ??= await createSupabaseClient()

    context.user ??= (await context.supabaseClient.auth.getUser()).data.user as User | undefined

    if (!context.user) {
        console.error(`${context.route} | user needs to be logged in`)
        return unauthorizedError();
    }

    return context as MiddlewareContextWithUser
}

export async function requireAdmin(context: MiddlewareContext): Promise<MiddlewareContextWithUser | NextResponse> {
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

    return context as MiddlewareContextWithUser
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateBody(schema: z.ZodObject<any>) {
    return async (
        context: MiddlewareContext,
        request: NextRequest,
    ): Promise<MiddlewareContext | NextResponse> => {
        context.body ??= await request.json()

        const { error } = schema.safeParse(context.body)

        if (error) {
            console.error(`${context.route} | route called with invalid body`)
            return badRequestError(JSON.parse(error.message))
        }

        return context
    }
}

export function requireExists(table: string, values: Record<string, unknown>) {
    return async (context: MiddlewareContext) => {
        context.supabaseClient ??= await createSupabaseClient()

        let selectCall = context.supabaseClient.from(table).select()

        for (const pair of Object.entries(values)) {
            selectCall = selectCall.eq(pair[0], pair[1])
        }

        const {
            data: idMatch,
            error: selectError,
        } = await selectCall

        if (selectError) {
            console.error(`${context.route} | unexpected supabase error when checking if value exists -> `, selectError.message);
            return internalServerError();
        }

        if (!idMatch || idMatch.length === 0) {
            console.error(`${context.route} | `)
            return notFoundError(`Could not find key value kombination ${Object.entries(values).flat().join(" ")} of ${table}`);
        }

        return context;
    }
}

export function requireUnique(table: string, keyValuePair: Record<string, string>) {
    return async (context: MiddlewareContext) => {
        context.supabaseClient ??= await createSupabaseClient()

        let selectCall = context.supabaseClient.from(table).select()

        for (const pair of Object.entries(keyValuePair)) {
            selectCall = selectCall.eq(pair[0], pair[1])
        }

        const {
            data: valueAlreadyExists,
            error: selectNameError,
        } = await selectCall

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
