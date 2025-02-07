"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client (backend only)
const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // Service role key (NEVER expose in frontend)
);

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Use Supabase Auth Admin API to check if the email exists
    const { data, error } = await adminSupabase.auth.admin.listUsers();
    if (error) throw error;

    const userExists = data.users.some((user) => user.email === email);
    if (userExists) {
      return { error: "This email is already registered. Please log in." };
    }

    // Proceed with signup if email does not exist
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) return { error: signUpError.message };

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return { error: "Error checking user existence." };
  }
}
