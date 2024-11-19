import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Item } from "../../../types/item";

export async function POST(req: NextRequest) {
  const createImageRequest = (await req.json()) as Item;
  console.log(createImageRequest);
  const supabase = await createClient();
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

  //#region check request
  if(!createImageRequest.category_id) {
    return new NextResponse(`\"category_id\" has to be set in the body`, {
      status: 400,
    });
  }

  
  if(!createImageRequest.title) {
    return new NextResponse(`\"title\" has to be set in the body`, {
      status: 400,
    });
  }

  
  if(!createImageRequest.artist) {
    return new NextResponse(`\"artist\" has to be set in the body`, {
      status: 400,
    });
  }

  
  if(!createImageRequest.motive_height) {
    return new NextResponse(`\"motive_height\" has to be set in the body`, {
      status: 400,
    });
  }
  
  if(!createImageRequest.motive_width) {
    return new NextResponse(`\"motive_width\" has to be set in the body`, {
      status: 400,
    });
  }

  if(!createImageRequest.height) {
    return new NextResponse(`\"height\" has to be set in the body`, {
      status: 400,
    });
  }

  if(!createImageRequest.width) {
    return new NextResponse(`\"width\" has to be set in the body`, {
      status: 400,
    });
  }

  if(!createImageRequest.price) {
    return new NextResponse(`\"price\" has to be set in the body`, {
      status: 400,
    });
  }

  if (!createImageRequest.image) {
    return new NextResponse(`\"image\" has to be set in the body`, {
      status: 400,
    });
  }
  //#endregion

  const imageId = uuidv4();
  const image_path = `${imageId}.${createImageRequest.image.type}`;

  const { data, error } = await supabase
    .from("image")
    .insert([
      {
        category_id: createImageRequest.category_id,
        title: createImageRequest.title,
        artist: createImageRequest.artist,
        motive_height: createImageRequest.motive_height,
        motive_width: createImageRequest.motive_width,
        height: createImageRequest.height,
        width: createImageRequest.width,
        price: createImageRequest.price,
        notice: createImageRequest.notice ?? null,
        image_path: image_path,
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

  const { error: storageError } = await supabase.storage
    .from("images")
    .upload(image_path, createImageRequest.image, {
      cacheControl: '3600',
      upsert: false,
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

  return new NextResponse(`${JSON.stringify(data)}`, {
    status: 200,
  });
}