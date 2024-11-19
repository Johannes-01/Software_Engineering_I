'use server';

import { createClient } from '@utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request,
    { imageId }: { imageId: string }
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', imageId)
        .single();

    if (error) {
        return new NextResponse(`Error while fetching image ${error}`, {
            status: 500,
        });
    }

    return new NextResponse(JSON.stringify(data), {
        status: 200,
    });
}