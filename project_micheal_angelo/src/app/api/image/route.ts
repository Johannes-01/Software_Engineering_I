'use server';

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { ItemRequest } from "../../../types/item";
import { Buffer } from "buffer";
import { createSupabaseClient } from '@utils/supabase-helper'

// todo requireAdmin middleware
export async function POST(req: NextRequest) {
  let file: File | undefined;
  let itemData: ItemRequest | undefined;

  if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      file = formData.get("file") as File | undefined;
      const formDataItemData = formData.get("itemData") ?? "";
      const formDataString = formDataItemData.toString();
      itemData = JSON.parse(formDataString)  as ItemRequest | undefined;
      console.log(itemData);
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
      itemData = (await req.json()) as ItemRequest;
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
  const requiredFields: (keyof ItemRequest)[] = [
    "category",
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

  let imageId: string | undefined;

  if (file) {
    try {
      imageId = uuidv4();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (!file.type.startsWith("image/")) {
        return new NextResponse(`File is not an image.`, {
          status: 400,
        });
      }

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
        category_id: itemData.category,
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