import { handlerWithPreconditions, MiddlewareContext, requireUser } from "@utils/custom-middleware";
import { isAdmin } from "@utils/supabase-helper";
import { forbiddenError, internalServerError } from "@utils/server-errors";
import { NextResponse } from "next/server";

interface GetContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
    user: Exclude<MiddlewareContext["user"], undefined>
}

export const GET = handlerWithPreconditions<GetContext>(
    [requireUser],
    async (
        {
            supabaseClient,
            user,
            route,
        },
        _,
        { params }: { params: Promise<{ userId: string, imageId: string }> }
    ) => {
        const userId = (await params).userId
        const imageId = (await params).imageId

        if (!isAdmin(user) && user.id !== userId) {
            return forbiddenError()
        }

        const {
            data,
            error
        } = await supabaseClient.from("selection").select("*").eq("id", imageId)

        if (error) {
            console.error(`${route} | ${error.message}`)
            return internalServerError()
        }

        return NextResponse.json(data[0])
    }
)