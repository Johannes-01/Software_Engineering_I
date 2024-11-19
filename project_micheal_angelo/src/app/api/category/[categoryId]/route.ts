'use server';

import { createClient } from '@utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request,
    { categoryId }: { categoryId: string }
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

    if (error) {
        return new NextResponse(`Error while fetching category ${error}`, {
            status: 500,
        });
    }

    return new NextResponse(JSON.stringify(data), {
        status: 200,
    });
}