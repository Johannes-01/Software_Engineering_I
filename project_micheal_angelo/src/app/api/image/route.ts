import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { decode } from "base64-arraybuffer";
import { v4 as uuidv4 } from "uuid";

interface PostImageRequest {
  category_id: number;
  title: string;
  artist: string;
  motive_height: number;
  motive_width: number;
  height: number;
  width: number;
  price: number;
  notice?: string;
  image_path: string;
}

export async function POST(req: NextRequest) {
  const createImageRequest = (await req.json()) as PostImageRequest;
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

  if (!createImageRequest.image_path) {
    return new NextResponse(`\"image_path\" has to be set in the body`, {
      status: 400,
    });
  }

  if (!isBase64Image(createImageRequest.image_path)) {
    return new NextResponse(`\"image_path\" has to be a base64 string`, {
      status: 400,
    });
  }
  //#endregion

  const imageId = uuidv4();
  const base64 = createImageRequest.image_path;
  createImageRequest.image_path = `${imageId}.${base64.split("data:image/")[1]?.split(";")[0]}`;
  console.log(createImageRequest);

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
        image_path: createImageRequest.image_path,
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
    .upload(`${imageId}.${base64.split("data:image/")[1]?.split(";")[0]}`, decode(base64));

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

function isBase64Image(str: string): boolean {
  // Check if the string starts with data:image/ prefix
  if (!str.startsWith("data:image/")) {
    return false;
  }

  const allowedMimeTypes: string[] = ["jpeg", "png", "gif", "svg", "webp"];
  const mimeType = str.split("data:image/")[1]?.split(";")[0];
  if (!allowedMimeTypes.includes(mimeType)) {
    return false;
  }

  // Check if it's properly formatted with base64 indicator
  if (!str.includes(";base64,")) {
    return false;
  }

  try {
    // Get the base64 content after the comma
    const base64Content = str.split(";base64,")[1];

    // Try to decode it - if it fails, it's not valid base64
    atob(base64Content);

    return true;
  } catch {
    return false;
  }
}
