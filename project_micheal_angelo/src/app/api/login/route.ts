import { createClient } from '@utils/supabase/server'
import { NextResponse } from 'next/server';

interface LoginRequest {
    email: string;
    password: string;
}

export async function POST(req: Request) {
    const loginRequest = (await req.json()) as LoginRequest;

    if (!loginRequest.email) {
        return new NextResponse("Email falsy", {
            status: 400,
        });
    }

    if (!loginRequest.password) {
        return new NextResponse("Password falsy", {
            status: 400,
        });
    }

    const supabase = await createClient();

    const {
        error,
        data,
    } = await supabase.auth.signInWithPassword(
        {
            email: loginRequest.email,
            password: loginRequest.password,
        },
    );

    if (error) {
        return new NextResponse(`Error while logging in ${error}`, {
            status: 500,
        });
    }

    return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
