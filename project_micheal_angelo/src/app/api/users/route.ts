'use server';

import { handlerWithPreconditions, MiddlewareContext, requireAdmin } from "@utils/custom-middleware";
import { getAllUsers } from "../../../services/get-all-users";
import { NextResponse } from "next/server";
import { internalServerError } from "@utils/server-errors";

interface GetContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
}

export const GET = handlerWithPreconditions<GetContext>(
    [requireAdmin],
    async () => {
        const data = await getAllUsers()

        if (data === undefined) {
            return internalServerError()
        }

        return NextResponse.json(data)
    }
)