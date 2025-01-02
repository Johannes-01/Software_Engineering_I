import { createSupabaseClient } from '@utils/supabase-helper';
import { NextResponse } from 'next/server';
// import z from "zod";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    // todo use zod for the validation
    if(!email){
        return new NextResponse("Email falsy", {
            status: 400,
        });
    }

    // todo check password for minimun requirements
    if(!password){
        return new NextResponse("Password falsy", {
            status: 400,
        });
    }

    // Passwort-Check
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if(!passwordRegex.test(password)){
        return new NextResponse("Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben sowie eine Zahl enthalten.",
            { status: 400}
        );
    }

    const supabase = await createSupabaseClient();

    const {
        error,
        data,
    } = await supabase.auth.signUp({
            email,
            password,
        });

    if (error) {
        if (error.message.includes("already registered")) {
            // prüfen ob die E-Mail bereits bestätigt wurde
            const { data: userCheck, error: userError } = await supabase
                .from("auth.users")
                .select("email_confirmed_at")
                .eq("email", email)
                .single();

            if (userError || !userCheck.email_confirmed_at) {
                return new NextResponse(
                    "E-Mail ist bereits registriert. Bitte bestätigen Sie Ihre E-Mail.",
                    { status: 400 }
                );
            }

            // E-Mail bereits registriert
            return new NextResponse("E-Mail wird bereits verwendet.", { status: 400 });
        }

        return new NextResponse(`Error while registering ${error}`, {
            status: 500,
        });
    }

    // Erfolgreiche Registrierung
    return new NextResponse(JSON.stringify(data), {
        status: 200,
    });
}
