import { createClient } from '@/utils/supabase/server'

export async function GET(){
    const supabase = await createClient()

    // how to set role?
    if((await supabase.auth.getUser()).data.user?.role === "admin")
    {
        // get all users
    }
}