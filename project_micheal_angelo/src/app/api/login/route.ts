import { createSupabaseClient } from '@utils/supabase-helper';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const LoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export async function POST(req: NextRequest) {
    const {
        data: loginCredentials,
        success: parsingSuccess,
        error: parsingError
    } = LoginSchema.safeParse(await req.json());

    if (!parsingSuccess) {
        return NextResponse.json(
            { errors: parsingError.message },
            { status: 400 }
        );
    }

    const supabase = await createSupabaseClient();

    const { error } = await supabase.auth.signInWithPassword(loginCredentials);

    if (error) {
        return NextResponse.json(
            { error: "E-Mail oder Passwort falsch" },
            { status: 401 }
        );
    }

    const url = req.nextUrl.clone()
    url.pathname = "gallery"
    return NextResponse.redirect(url);
}