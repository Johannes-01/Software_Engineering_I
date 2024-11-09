import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(
                        ({
                            name,
                            value,
                            options,
                        }) => supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const currentPath = request.nextUrl.pathname;

    if (
        !user
        && !currentPath.startsWith("/login")
        && !currentPath.startsWith("/register")
        && !currentPath.startsWith("/api")
        && (currentPath !== "/")
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url, { status: 302 });
    }

    if (
        user &&
        (currentPath.startsWith("/login")
        || currentPath.startsWith("/register"))
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/gallery";
        return NextResponse.redirect(url, { status: 302 });
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css)$).*)'
    ],
};
