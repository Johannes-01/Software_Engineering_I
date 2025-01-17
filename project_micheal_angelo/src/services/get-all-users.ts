import { createSupabaseAdminClient } from "@utils/supabase-helper";

export const getAllUsers = async () => {
    const {
        data: { users },
        error
    } = await (await createSupabaseAdminClient()).auth.admin.listUsers()

    if (error) {
        console.error("Error while fetching users", error)
        return undefined
    }

    return users
        .filter(user => user.user_metadata.role !== "admin")
        .map(user => ({
            id: user.id,
            email: user.email
        }))
}