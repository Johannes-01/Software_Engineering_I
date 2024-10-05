import { createClient } from '@utils/supabase/server';
import { NextResponse } from 'next/server';
// import z from "zod";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    // please use zod for the validation
    if(!email){
        return new NextResponse("Email falsy", {
            status: 400,
        });
    }

    // todo: check password for minimun requirements
    if(!password){
        return new NextResponse("Password falsy", {
            status: 400,
        });
    }

    const supabase = await createClient()

    const {
        error,
        data,
    } = await supabase.auth.signUp(
        {
            email,
            password,
        },
    );

    if (error) {
        // todo: if email no yet confirmed tell the fe and give user message
        return new NextResponse(`Error while registering ${error}`, {
            status: 500,
        });
    }

    return new NextResponse(JSON.stringify(data), {
        status: 200,
    });
}
