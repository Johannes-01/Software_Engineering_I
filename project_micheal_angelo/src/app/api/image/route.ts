import { createClient } from '@utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server';
import { decode } from 'base64-arraybuffer'
import { v4 as uuidv4 } from 'uuid';

interface PostImageRequest{
    artist: string;
    imageBase64: string;
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

    // to do set up authorization with policies in supabase
    if (false) {
        return new NextResponse(`User not authorized.`, {
            status: 403,
        });
    }

    if(!createImageRequest.artist) {
        return new NextResponse(`\"artist\" has to be set in the body.`, {
            status: 400,
        });
    }
    
    if(!createImageRequest.imageBase64) {
        return new NextResponse(`\"imageBase64\" has to be set in the body`, {
            status: 400,
        });
    }

    // save image ref to tbl
    const { error, data } = await supabase
    .from('image')
    .insert({ art_dealer: createImageRequest.artist });
  
    if(error || !data){
        return new NextResponse(`Error while creating the db item for the image`, {
            status: 500,
        })
    }

    // todo get image id from data
    const imageId = data;

    const { error: storageError } = await supabase
        .storage
        .from('images')
        .upload(`public/${createImageRequest.artist}/${imageId}.png`, decode(createImageRequest.imageBase64), {
            contentType: 'image/png'
    });

    if(storageError)
    {
        return new NextResponse(`Error while uploading the image to the storage`, {
            status: 500,
        });
    }

}