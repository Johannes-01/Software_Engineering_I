'use server';

import { NextResponse } from "next/server";

export async function GET() {
    // const supabase = await createClient();
    return new NextResponse('success', {
        status: 200,
    });
}