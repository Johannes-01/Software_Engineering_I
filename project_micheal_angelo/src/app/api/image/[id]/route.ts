'use server';

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@utils/supabase-helper'

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