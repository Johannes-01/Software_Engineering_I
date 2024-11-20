import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Item } from "../../../types/item";

export async function POST(req: NextRequest) {
  const createImageRequest = (await req.json()) as {
    item: Item,
    mimeType: string,
  };

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
  if(!createImageRequest.item.category_id) {
    return new NextResponse(`\"category_id\" has to be set in the body`, {
      status: 400,
    });
  }

  
  if(!createImageRequest.item.title) {
    return new NextResponse(`\"title\" has to be set in the body`, {
      status: 400,
    });
  }

  
  if(!createImageRequest.item.artist) {
    return new NextResponse(`\"artist\" has to be set in the body`, {
      status: 400,
    });
  }

  
  if(!createImageRequest.item.motive_height) {
    return new NextResponse(`\"motive_height\" has to be set in the body`, {
      status: 400,
    });
  }
  
  if(!createImageRequest.item.motive_width) {
    return new NextResponse(`\"motive_width\" has to be set in the body`, {
      status: 400,
    });
  }

  if(!createImageRequest.item.height) {
    return new NextResponse(`\"height\" has to be set in the body`, {
      status: 400,
    });
  }

  if(!createImageRequest.item.width) {
    return new NextResponse(`\"width\" has to be set in the body`, {
      status: 400,
    });
  }

  if(!createImageRequest.item.price) {
    return new NextResponse(`\"price\" has to be set in the body`, {
      status: 400,
    });
  }

  if (!createImageRequest.item.image) {
    return new NextResponse(`\"image\" has to be set in the body`, {
      status: 400,
    });
  }

  if(!createImageRequest.mimeType) {
    return new NextResponse(`\"mimiType\" has to be set in the body`, {
      status: 400,
    });
  }
  //#endregion

  const imageId = uuidv4();

  const { data, error } = await supabase
    .from("image")
    .insert([
      {
        category_id: createImageRequest.item.category_id,
        title: createImageRequest.item.title,
        artist: createImageRequest.item.artist,
        motive_height: createImageRequest.item.motive_height,
        motive_width: createImageRequest.item.motive_width,
        height: createImageRequest.item.height,
        width: createImageRequest.item.width,
        price: createImageRequest.item.price,
        notice: createImageRequest.item.notice ?? null,
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

  const bytes = await createImageRequest.item.image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error: storageError } = await supabase.storage
    .from("images")
    .upload(imageId, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: createImageRequest.mimeType,
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