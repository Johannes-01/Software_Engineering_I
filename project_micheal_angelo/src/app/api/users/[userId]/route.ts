import { handlerWithPreconditions, MiddlewareContext, requireUser } from "@utils/custom-middleware";
import { isAdmin } from "@utils/supabase-helper";
import { badRequestError, forbiddenError, internalServerError } from "@utils/server-errors";
import { NextResponse } from "next/server";
import z from "zod"
import { badRequest } from "next/dist/client/components/react-dev-overlay/server/shared";

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
            route
        },
        _,
        { params }: { params: Promise<{ userId: string }> }
    ) => {
        const userId = (await params).userId

        if (!isAdmin(user) && user.id !== userId) {
            return forbiddenError()
        }

        const {
            data,
            error
        } = await supabaseClient.from("selection").select("id, image_id, is_recommendation, image(*)").eq("customer_id", userId)

        if (error) {
            console.log(`${route} ${error.message}`)
            return internalServerError()
        }

        const dataWithUrls = data.map((item) => {
            const { data } = supabaseClient
                .storage
                .from('images')
                .getPublicUrl((item.image as any).image_path);
            (item as any).image.image_path = data.publicUrl;
            return item
        })

        return NextResponse.json(dataWithUrls)
    },
    {
        route: "/api/users/:userid :GET"
    }
)

interface DeleteContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>
    user: Exclude<MiddlewareContext["user"], undefined>
}

export const DELETE = handlerWithPreconditions<DeleteContext>(
    [requireUser],
    async (
        {
            supabaseClient,
            user,
            route
        },
        request,
        { params }: { params: Promise<{ userId: string }> }
    ) => {
        const userId = (await params).userId

        if (!isAdmin(user) && user.id !== userId) {
            return forbiddenError()
        }

        const deletionId = request.nextUrl.searchParams.get("id")

        if (!deletionId) {
            console.error(`${route} request was missing id in searchParams`)
            return badRequestError("searchParam id is required")
        }

        const {
            error
        } = await supabaseClient.from("selection").delete().eq("id", deletionId)

        if (error) {
            console.log(`${route} ${error.message}`)
            return internalServerError()
        }

        return new NextResponse("ok")
    },
    {
        route: "/api/users/:userid :GET"
    }
)