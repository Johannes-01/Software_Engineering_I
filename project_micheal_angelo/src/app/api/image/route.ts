import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";
import { createSupabaseClient } from "@utils/supabase-helper";
import { internalServerError } from "@utils/server-errors";
import { handlerWithPreconditions, MiddlewareContext, requireUser } from "@utils/custom-middleware";
import { Item } from "../../../types/item";

interface GetContext extends MiddlewareContext {
    supabaseClient: NonNullable<MiddlewareContext["supabaseClient"]>
}

export const GET = handlerWithPreconditions<GetContext>(
    [requireUser],
    async ({ supabaseClient, route }, request) => {
        const searchParams = new URL(request.url).searchParams

        const paginationIndex = Number.isInteger(Number(searchParams.get("p")))
            ? Number(searchParams.get("p"))
            : 0
        const title = searchParams.get("q")
        const artist = searchParams.get("a")
        const category = Number.isInteger(Number(searchParams.get("c")))
            ? Number(searchParams.get("c"))
            : undefined

        let supabaseQuery = supabaseClient
            .from("image")
            .select("*", { count: "exact" })

        if (title) {
            supabaseQuery = supabaseQuery.ilike("title", `%${title}%`)
        }

        if (artist) {
            supabaseQuery = supabaseQuery.ilike("artist", `%${artist}%`)
        }

        if (category) {
            supabaseQuery = supabaseQuery.eq("category_id", category)
        }

        const { data, error, count } = paginationIndex !== 0
            ? await supabaseQuery.range(paginationIndex, paginationIndex + 10)
            : await supabaseQuery;
 
        if (error) {
            console.error(`${route} | select -> `, error.message)
            return internalServerError()
        }

        const items = data as Item[];
        
        items.forEach((item) => {
            const { data } = supabaseClient
            .storage
            .from('images')
            .getPublicUrl(item.image_path);
            item.image_path = data.publicUrl;
        });
        
        return NextResponse.json({ maxCount: count, images: items }, { status: 200 })
    },
    {
        route: "/api/image:GET",
    }
)

export async function POST(req: NextRequest) {
    let file: File | undefined;
    let itemData: Item | undefined;

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
        try {
            const formData = await req.formData();
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
    } else if (req.headers.get("content-type")?.includes("application/json")) {
        try {
            itemData = (await req.json()) as Item;
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

    if (!itemData) {
        return new NextResponse(`Error while deserializing item.`, {
            status: 400,
        });
    }

    // todo validate itemData with zod
    const requiredFields: (keyof Item)[] = [
        "category_id",
        "title",
        "artist",
        "width",
        "height",
        "price",
    ];

    for (const field of requiredFields) {
        if (
            itemData[field] === undefined ||
            itemData[field] === null ||
            ((field === "width" || field === "height" || field === "price") &&
                isNaN(Number(itemData[field])))
        ) {
            return NextResponse.json(
                { error: `Missing or invalid required field: ${field}` },
                { status: 400 }
            );
        }
    }

    const supabase = await createSupabaseClient();
    const user = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse(`User not authenticated.`, {
            status: 401,
        });
    }

    //todo set up authorization
    if (false) {
        return new NextResponse(`User not authorized.`, {
            status: 403,
        });
    }

    let imageId: string | undefined;

    if (file) {
        try {
            imageId = uuidv4();
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { error: storageError } = await supabase.storage
                .from("images")
                .upload(imageId, buffer, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type,
                });

            if (storageError) {
                return new NextResponse(
                    `Error while uploading the image to the storage: ${JSON.stringify(
                        storageError
                    )}`,
                    {
                        status: 500,
                    }
                );
            }
        } catch (error) {
            return new NextResponse(
                `Error while reading the image data into an ArrayBuffer: ${JSON.stringify(
                    error
                )}`,
                {
                    status: 500,
                }
            );
        }
    }

    const { data, error } = await supabase
        .from("image")
        .insert([
            {
                category_id: itemData.category_id,
                title: itemData.title,
                artist: itemData.artist,
                motive_height: itemData.motive_height,
                motive_width: itemData.motive_width,
                height: itemData.height,
                width: itemData.width,
                price: itemData.price,
                notice: itemData.notice,
                image_path: imageId,
            },
        ])
        .select();

    if (error) {
        return new NextResponse(
            `Error while creating the db item for the image: ${JSON.stringify(
                error
            )}}`,
            {
                status: 500,
            }
        );
    }

    return new NextResponse(`${JSON.stringify(data)}`, {
        status: 200,
    });
}