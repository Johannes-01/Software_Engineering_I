import { createSupabaseClient } from '@utils/supabase-helper'
import { NextResponse } from 'next/server';

interface LoginRequest {
    email: string;
    password: string;
}

export async function POST(req: Request) {
    const { email, password } = await req.json() as LoginRequest;

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!password) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const supabase = await createSupabaseClient();

    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return NextResponse.json({ error: "E-Mail oder Passwort falsch" }, { status: 401 });
        }

        return new NextResponse("ok", { status: 200 });
    } catch (error) {
        console.error("Unerwarteter Fehler:", error);
        return NextResponse.json(
            { error: "Ein unerwarteter Fehler ist aufgetreten" },
            { status: 500 }
        );
    }
}
