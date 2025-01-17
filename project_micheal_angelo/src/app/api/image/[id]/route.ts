'use server';

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@utils/supabase-helper'
import { Item } from '@type/item';
import { handlerWithPreconditions, MiddlewareContext, requireAdmin, requireExists, validateBody } from '@utils/custom-middleware';
import { internalServerError } from '@utils/server-errors';

interface PutContext extends MiddlewareContext {
    supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>,
    body: any
}

type Slug = { params: { id: string } };

const imageShouldExist = async (context: MiddlewareContext, _: unknown, { params }: Slug) => requireExists(
    "image",
    { id: params.id }
)(context)

export const PUT = handlerWithPreconditions<PutContext>(
    [
        requireAdmin,
        imageShouldExist,
    ],
    async ({ supabaseClient, route }, request, { params }: Slug) => {
        let file: File | undefined;
        let itemData: Item | undefined;
                
        if (request.headers.get("content-type")?.includes("multipart/form-data")) {
            try {
                const formData = await request.formData();
                file = formData.get("file") as File | undefined;
                const formDataItemData = formData.get("itemData") ?? "";
                const formDataString = formDataItemData.toString();
                itemData = JSON.parse(formDataString) as Item | undefined;
            } catch (error) {
                return new NextResponse(
                    `Error while deserializing item and file: ${error}`,
                    {
                        status: 400,
                    }
                );
            }
        } else if (request.headers.get("content-type")?.includes("application/json")) {
            try {
                itemData = (await request.json()) as Item;
            } catch (error) {
                return new NextResponse(`Error while deserializing item: ${error}`, {
                    status: 400,
                });
            }
        } else {
            return NextResponse.json(
                {
                    error:
                        "Invalid request type. Must be 'multipart/form-data' or 'application/json'",
                },
                { status: 400 }
            );
        }

        console.log(itemData);
        console.log(file?.name ?? "");
        console.log(params.id);
        
        if(itemData) {
            const { error } = await supabaseClient
            .from("image")
            .update({
                ...(itemData.category_id === undefined ? {} : { category_id: itemData.category_id }),
                ...(itemData.title === undefined ? {} : { title : itemData.title }),
                ...(itemData.artist === undefined ? {} : { artist: itemData.artist }),
                ...(itemData.width === undefined ? {} : { width: itemData.width }),
                ...(itemData.height === undefined ? {} : { height: itemData.height }),
                ...(itemData.motive_width === undefined ? {} : { motive_width: itemData.motive_width }),
                ...(itemData.motive_height === undefined ? {} : { motive_width: itemData.motive_height }),
                ...(itemData.price === undefined ? {} : { price: itemData.price }),
                ...(itemData.notice === undefined ? {} : { notice: itemData.notice }),
            })
            .eq("id", params.id);

            if (error) {
                console.error(`${route} -> ${error.message}`)
                return internalServerError()
            }

            console.log((await supabaseClient.from("image").select("*").eq("id", params.id)).data); 
        }

        if(file && itemData?.image_path) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);            

            const { error } = await supabaseClient.storage
            .from('images')
           .update(itemData.image_path, buffer, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type
            })

            if (error) {
                console.error(`${route} -> ${error.message}`)
                return internalServerError()
            }
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