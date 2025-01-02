import { createServerClient } from '@supabase/ssr'
import { User } from "@supabase/supabase-js";
import { cookies } from 'next/headers'

export async function createSupabaseClient() {
    const cookieStore = cookies();

    return createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(
                        ({
                            name,
                            value,
                            options,
                        }) => cookieStore.set(name, value, options),
                    );
                },
            },
        },
    )
}

export function isAdmin(user: User) {
    return user.user_metadata.role === "admin";
}

export async function createSupabaseAdminClient() {
    const cookieStore = cookies()

    return createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ADMIN_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(
                        ({
                             name,
                             value,
                             options,
                         }) => cookieStore.set(name, value, options),
                    );
                },
            },
        }
    )
}