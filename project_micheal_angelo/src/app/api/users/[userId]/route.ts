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