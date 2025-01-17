"use server";

import { NextResponse } from "next/server";
import { createSupabaseClient } from "@utils/supabase-helper";
import { Item, ItemRequest } from "@type/item";
import {
  handlerWithPreconditions,
  MiddlewareContext,
  requireAdmin,
  requireExists,
  validateBody,
} from "@utils/custom-middleware";
import { internalServerError } from "@utils/server-errors";
import { v4 as uuidv4 } from "uuid";

interface PutContext extends MiddlewareContext {
  supabaseClient: Exclude<MiddlewareContext["supabaseClient"], undefined>;
  body: any;
}

type Slug = { params: { id: string } };

const imageShouldExist = async (
  context: MiddlewareContext,
  _: unknown,
  { params }: Slug
) => requireExists("image", { id: params.id })(context);

export const PUT = handlerWithPreconditions<PutContext>(
  [requireAdmin, imageShouldExist],
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
    } else if (
      request.headers.get("content-type")?.includes("application/json")
    ) {
      try {
        itemData = JSON.parse(await request.json()) as Item;
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

    const newImagePath = uuidv4();

    if (itemData) {
      const { error } = await supabaseClient
        .from("image")
        .update({
          ...(itemData.category_id === undefined
            ? {}
            : { category_id: itemData.category_id }),
          ...(itemData.title === undefined ? {} : { title: itemData.title }),
          ...(itemData.artist === undefined ? {} : { artist: itemData.artist }),
          ...(itemData.width === undefined ? {} : { width: itemData.width }),
          ...(itemData.height === undefined ? {} : { height: itemData.height }),
          ...(itemData.motive_width === undefined
            ? {}
            : { motive_width: itemData.motive_width }),
          ...(itemData.motive_height === undefined
            ? {}
            : { motive_width: itemData.motive_height }),
          ...(itemData.price === undefined ? {} : { price: itemData.price }),
          ...(itemData.notice === undefined ? {} : { notice: itemData.notice }),
          image_path: newImagePath,
        })
        .eq("id", params.id)
        .select();

      if (error) {
        console.error(`${route} -> ${JSON.stringify(error)}`);
        return internalServerError();
      }
    }

    if (file && itemData?.image_path) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // delete old image
      const { error: deleteError } = await supabaseClient.storage
        .from("images")
        .remove([`${itemData.image_path}`]);

      if (deleteError) {
        console.error(`${route} -> ${JSON.stringify(deleteError)}`);
        return internalServerError();
      }

      // create new image
      const { error: storageError } = await supabaseClient.storage
        .from("images")
        .upload(newImagePath, buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (storageError) {
        console.error(`${route} -> ${JSON.stringify(storageError)}`);
        return internalServerError();
      }
    }

    return new NextResponse("Updated", { status: 200 });
  },
  {
    route: "/api/image/[id]:PUT",
  }
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("image")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return new NextResponse(`Error while fetching image ${error.message}`, {
      status: 500,
    });
  }

  const { data: imageUrl } = supabase.storage
    .from("images")
    .getPublicUrl(data.image_path);

  data.image_path = imageUrl.publicUrl;

  return new NextResponse(JSON.stringify(data), {
    status: 200,
  });
}
