'use server';

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@utils/supabase-helper'
import { ItemRequest } from '@type/item';
import { handlerWithPreconditions, MiddlewareContext, requireAdmin, requireExists, validateBody } from '@utils/custom-middleware';
import { z } from 'zod';
import { internalServerError } from '@utils/server-errors';

interface PutContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>,
    body: ItemRequest
}

type Slug = { params: { id: string } };

const putBody = z.object({
    category_id: z.number(),
    title: z.string(),
    artist: z.string(),
    width: z.number(),
    height: z.number(),
    motive_width: z.number(),
    motive_height: z.number(),
    price: z.number(),
    notice: z.string(),
})

const imageShouldExist = async (context: MiddlewareContext, _: unknown, { params }: Slug) => requireExists(
    "image",
    { id: params.id }
)(context)

export const PUT = handlerWithPreconditions<PutContext>(
    [
        requireAdmin,
        validateBody(putBody),
        imageShouldExist,
    ],
    async ({ supabaseClient, body, route }, _, { params }: Slug) => {
        const { error } = await supabaseClient
            .from("image")
            .update({
                ...(body.artist === undefined ? {} : { artist: body.artist }),
            })
            .eq("id", params.id)

        if (error) {
            console.error(`${route} -> ${error.message}`)
            return internalServerError()
        }

        return new NextResponse("Updated", { status: 200 })
    },
    {
        route: "/api/image/[id]:PUT",
    },
)

export async function GET(request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from('image')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error) {
        return new NextResponse(`Error while fetching image ${error.message}`, {
            status: 500,
        });
    }

    const { data: imageUrl } = supabase
        .storage
        .from('images')
        .getPublicUrl(data.image_path)

    data.image_path = imageUrl.publicUrl

    return new NextResponse(JSON.stringify(data), {
        status: 200,
    });
}